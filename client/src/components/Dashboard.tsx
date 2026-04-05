
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle2, FileText, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [patToken, setPatToken] = useState('');
  const [targetPath, setTargetPath] = useState('');
  const [filesPayload, setFilesPayload] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Background Executor Trigger
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch('/api/executor');
        console.log("[Auto-Commit] Checking for pending commits...");
      } catch (e) {
        console.error("Executor ping failed", e);
      }
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const onDrop = async (acceptedFiles: File[]) => {
    const payloads = await Promise.all(
      acceptedFiles.map(async (file) => {
        const text = await file.text();
        // Sanitize path: Windows backslashes \ and excessive slashes break GitHub API //
        const relativePath = ((file as any).path || file.name).replace(/\\/g, '/');
        const cleanPath = relativePath.replace(/^\/+/, ''); 

        return {
          path: cleanPath,
          content: text
        };
      })
    );
    setFilesPayload(payloads);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filesPayload.length) {
      setStatus('Error: Please upload at least 1 file.');
      return;
    }
    setLoading(true);
    setStatus('Scheduling...');

    // Apply targetPath dynamically at submission time
    const finalFilesPayload = filesPayload.map(file => {
      let finalPath = file.path;
      if (targetPath) {
        const sanitizedPrefix = targetPath.replace(/\\/g, '/');
        finalPath = `${sanitizedPrefix}/${finalPath}`.replace(/\/+/g, '/').replace(/^\/+/, '');
      }
      return { ...file, path: finalPath };
    });

    const payload = {
      repoOwner,
      repoName,
      commitMessage,
      scheduledTime: new Date(scheduledTime).toISOString(),
      patToken,
      filesPayload: JSON.stringify(finalFilesPayload)
    };

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule');
      
      setStatus('Success! Commit scheduled in local DB.');
      setFilesPayload([]);
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Auto-Commit Dashboard</h1>
        <p className="text-zinc-500">Scheduled stealth pushes to GitHub via API</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl p-8 shadow-sm space-y-6 flex flex-col">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub Username (Owner)</label>
            <input required type="text" value={repoOwner} onChange={e => setRepoOwner(e.target.value)} placeholder="e.g. johndoe" className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository Name</label>
            <input required type="text" value={repoName} onChange={e => setRepoName(e.target.value)} placeholder="e.g. ukk-backend" className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Folder di Repo GitHub (Opsional)</label>
          <input type="text" value={targetPath} onChange={e => setTargetPath(e.target.value)} placeholder="e.g. backend (biarkan kosong jk di root)" className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
          <div className="text-xs text-zinc-500 space-y-1">
            <p>Penjelasan khusus Laravel:</p>
            <ul className="list-disc list-inside">
              <li><strong>Kosongkan kotak ini:</strong> Jika repo GitHub ini <em>isinya full</em> Laravel saja.</li>
              <li><strong>Isi dengan nama folder (contoh: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">backend</code>):</strong> Jika Laravel-nya masuk ke dalam satu folder khusus karena digabung dengan aplikasi Frontend (Vue/React).</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Commit Message</label>
          <input required type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} placeholder="e.g. feat: add auth controller" className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scheduled Time</label>
            <input required type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Personal Access Token (PAT)</label>
            <input required type="password" value={patToken} onChange={e => setPatToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className="w-full px-4 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-zinc-500">Requires `repo` scope.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Files to Push</label>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2">
                <span className="text-lg"></span> Tips Upload Project Laravel
              </p>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-400 space-y-1 ml-1 text-xs md:text-sm">
                <li><strong>JANGAN</strong> upload folder <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">vendor/</code> dan <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">node_modules/</code> (ukurannya terlalu besar).</li>
                <li>Upload khusus folder inti kodingan saja: <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">app/</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">routes/</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">resources/</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">database/</code>.</li>
                <li>Upload manual file pengaturan seperti <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">composer.json</code>, <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">package.json</code>, dan <code className="bg-blue-100 dark:bg-blue-800 px-1 py-0.5 rounded font-mono select-all">.env.example</code>.</li>
              </ul>
            </div>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700'}`}>
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 text-zinc-400 mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">
              Drag & drop files here, or click to select files.
            </p>
          </div>

          {filesPayload.length > 0 && (
            <div className="mt-4 border dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b dark:border-zinc-800 flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> {filesPayload.length} files staged
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFilesPayload([]); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto divide-y dark:divide-zinc-800">
                {filesPayload.map((file, idx) => (
                  <div key={idx} className="flex flex-row items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                      <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate font-mono text-xs" title={file.path}>
                        {file.path}
                      </span>
                      <span className="text-xs text-zinc-500 flex-shrink-0">
                        ({(file.content.length / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setFilesPayload(prev => prev.filter((_, i) => i !== idx)); 
                      }}
                      className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button disabled={loading} type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black font-semibold py-3 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50">
          {loading ? 'Processing...' : 'Schedule Commit'}
        </button>

        {status && (
          <div className={`p-4 text-sm font-medium rounded-lg text-center ${status.includes('Error') ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
