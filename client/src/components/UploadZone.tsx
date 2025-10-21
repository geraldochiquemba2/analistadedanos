import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UploadZoneProps {
  onAnalyze: (files: File[], description: string, assetInfo: AssetInfo) => void;
  isAnalyzing?: boolean;
}

export interface AssetInfo {
  assetType: string;
  brand?: string;
  model?: string;
  year?: string;
  quality?: string;
}

export function UploadZone({ onAnalyze, isAnalyzing = false }: UploadZoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [assetType, setAssetType] = useState("vehicle");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [quality, setQuality] = useState("medium");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
    disabled: isAnalyzing,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (files.length > 0) {
      const assetInfo: AssetInfo = {
        assetType,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        year: year.trim() || undefined,
        quality,
      };
      onAnalyze(files, description, assetInfo);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-md min-h-64 flex flex-col items-center justify-center p-8 transition-colors cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover-elevate"}
          ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}
        `}
        data-testid="dropzone-upload"
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          {isDragActive ? "Solte as imagens aqui" : "Arraste imagens para cá"}
        </p>
        <p className="text-sm text-muted-foreground">
          ou clique para selecionar arquivos (máximo 10 imagens)
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-video bg-muted rounded-md overflow-hidden border border-border"
              data-testid={`image-preview-${index}`}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={isAnalyzing}
                data-testid={`button-remove-${index}`}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Descrição Adicional (Opcional)</Label>
        <Textarea
          id="description"
          placeholder="Descreva o contexto dos danos, circunstâncias, etc..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isAnalyzing}
          rows={3}
          className="resize-none"
          data-testid="input-description"
        />
        <p className="text-xs text-muted-foreground">
          {description.length} caracteres
        </p>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={files.length === 0 || isAnalyzing}
        className="w-full"
        size="lg"
        data-testid="button-analyze"
      >
        {isAnalyzing ? (
          <>
            <span className="animate-pulse">Analisando...</span>
          </>
        ) : (
          <>
            <ImageIcon className="mr-2 h-5 w-5" />
            Analisar Danos ({files.length} {files.length === 1 ? "imagem" : "imagens"})
          </>
        )}
      </Button>
    </div>
  );
}
