"use client";
import { useState } from "react";

export default function ResumeForm() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);

    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        alert("Error: " + result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-8 transition-all">
        <h1 className="text-gray-900 text-3xl font-bold mb-6 text-center tracking-tight">
          Resume Parser
        </h1>

        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {file && (
          <p className="mb-4 text-gray-700 text-center">
            📎 <strong>{file.name}</strong> selected
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Parsing..." : "Upload & Parse Resume"}
        </button>

        {data && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-sm text-gray-800 space-y-3">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">
              📄 Resume Summary
            </h2>
            <p>
              <strong> Name:</strong> {data.name}
            </p>
            <p>
              <strong> Email:</strong> {data.email}
            </p>
            <p>
              <strong> Phone:</strong> {data.phone}
            </p>
            <p>
              <strong> Education:</strong> {data.education}
            </p>
            <p>
              <strong> Experience:</strong> {data.experience_years}
            </p>
            <p>
              <strong> Skills:</strong> {data.skills?.join(", ")}
            </p>
            <p>
              <strong> Suggested Roles:</strong> {data.suggested_roles?.join(", ")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
