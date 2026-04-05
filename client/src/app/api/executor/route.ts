import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Octokit } from 'octokit';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    
    // Find all pending commits that are due (scheduled in the past or now)
    const pendingCommits = await prisma.scheduledCommit.findMany({
      where: {
        status: 'PENDING',
        scheduledTime: {
          lte: now,
        }
      }
    });

    if (pendingCommits.length === 0) {
      return NextResponse.json({ message: 'No pending commits due.' }, { status: 200 });
    }

    const results = [];

    for (const commit of pendingCommits) {
      try {
        const octokit = new Octokit({ auth: commit.patToken });

        // 1. Check branch references
        let latestCommitSha = '';
        let branchRefName = '';
        
        try {
          const { data: refData } = await octokit.rest.git.getRef({
            owner: commit.repoOwner,
            repo: commit.repoName,
            ref: 'heads/main', 
          });
          latestCommitSha = refData.object.sha;
          branchRefName = refData.ref.replace('refs/', '');
        } catch (err) {
          // Fallback to master if main doesn't exist
          const { data: refDataMaster } = await octokit.rest.git.getRef({
            owner: commit.repoOwner,
            repo: commit.repoName,
            ref: 'heads/master',
          });
          latestCommitSha = refDataMaster.object.sha;
          branchRefName = refDataMaster.ref.replace('refs/', '');
        }
        
        // 2. Get the commit tree
        const { data: latestCommit } = await octokit.rest.git.getCommit({
          owner: commit.repoOwner,
          repo: commit.repoName,
          commit_sha: latestCommitSha,
        });

        const baseTreeSha = latestCommit.tree.sha;

        // 3. Create blob objects for each file and populate a tree structure
        const filesPayload = JSON.parse(commit.filesPayload);
        const treeItems = [];

        for (const file of filesPayload) {
           treeItems.push({
             path: file.path,
             mode: '100644', // standard file
             type: 'blob',
             content: file.content
           });
        }

        // 4. Create a new Tree in Github DB
        const { data: newTree } = await octokit.rest.git.createTree({
          owner: commit.repoOwner,
          repo: commit.repoName,
          base_tree: baseTreeSha,
          tree: treeItems as any,
        });

        // 5. Spoof the user data so it feels 100% authentic
        const { data: authUser } = await octokit.rest.users.getAuthenticated();
        
        // 6. Execute commit via DB Commit Tree
        const { data: newCommit } = await octokit.rest.git.createCommit({
          owner: commit.repoOwner,
          repo: commit.repoName,
          message: commit.commitMessage,
          tree: newTree.sha,
          parents: [latestCommitSha],
          author: {
             name: authUser.name || authUser.login,
             email: authUser.email || `${authUser.id}+${authUser.login}@users.noreply.github.com`,
             date: commit.scheduledTime.toISOString()
          },
          committer: {
             name: authUser.name || authUser.login,
             email: authUser.email || `${authUser.id}+${authUser.login}@users.noreply.github.com`,
             date: commit.scheduledTime.toISOString()
          }
        });

        // 7. Push Update Reference
        await octokit.rest.git.updateRef({
          owner: commit.repoOwner,
          repo: commit.repoName,
          ref: branchRefName,
          sha: newCommit.sha,
          force: false 
        });

        // 8. Mark as DONE in database
        await prisma.scheduledCommit.update({
          where: { id: commit.id },
          data: { status: 'DONE' }
        });
        
        results.push({ id: commit.id, status: 'success' });

      } catch (err: any) {
        console.error(`Failed executing commit ID ${commit.id}:`, err);
        results.push({ id: commit.id, status: 'failed', error: err.message || err.toString() });
        // Mark as FAILED to prevent lock loops
        await prisma.scheduledCommit.update({
             where: { id: commit.id },
             data: { status: 'FAILED' }
        });
      }
    }

    return NextResponse.json({ executed: results.length, results });

  } catch (err: any) {
    console.error("Executor Critical Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
