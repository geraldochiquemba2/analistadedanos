import { UploadZone } from "../UploadZone";

export default function UploadZoneExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <UploadZone
        onAnalyze={(files, description) => {
          console.log("Análise iniciada:", { files, description });
        }}
        isAnalyzing={false}
      />
    </div>
  );
}
