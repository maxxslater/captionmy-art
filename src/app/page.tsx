'use client'; // This is a Client Component for interactive upload

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setCaption(null);
      setError(null);
    },
  });

  const handleGenerate = async () => {
   console.log('handleGenerate started');  
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
     console.log('Starting reader for base64');  // ← add 
      // For MVP: Convert image to base64 and send directly (no Supabase upload yet)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1]; // remove data:image/...;base64,

        const res = await fetch('/api/generate-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            // Add later: goal, tone, format, lang, etc.
          }),
        });

        console.log('Fetch response status:', res.status);  // ← add

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate');

        setCaption(data.caption);
      };
      reader.readAsDataURL(image);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8">CaptionMy.Art</h1>

      <div
        {...getRootProps()}
        className={`w-full max-w-xl border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
          isDragActive ? 'border-blue-500 bg-blue-900/30' : 'border-gray-600 hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="max-h-80 mx-auto rounded-lg shadow-lg" />
        ) : (
          <p className="text-xl">
            {isDragActive ? 'Drop the artwork here...' : 'Drag & drop your art, or click to select'}
          </p>
        )}
      </div>

      {image && (
        <button
          onClick={handleGenerate}
          disabled={loading || !image}
          className="mt-6 px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Caption'}
        </button>
      )}

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {caption && (
        <div className="mt-10 w-full max-w-2xl bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl mb-4">Generated Caption:</h2>
          <pre className="whitespace-pre-wrap text-lg">{caption}</pre>
        </div>
      )}
    </main>
  );
}