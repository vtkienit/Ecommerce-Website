import { useEffect, useMemo, useState } from "react";
import { Check, ImagePlus, LoaderCircle, Trash2, Upload, X } from "lucide-react";
import { useLanguage } from "../../../app/contexts/LanguageContext";
import { deleteImage, updateImage, uploadImages } from "../api/catalogAdminApi";
import type { AdminImage, AdminProduct } from "../model/catalogAdminTypes";
import { dangerButtonClass, primaryButtonClass, secondaryButtonClass } from "./adminCatalogStyles";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_FILES = "image/jpeg,image/png,image/webp";

type Props = {
  product: AdminProduct;
  onChange: (product: AdminProduct) => void;
  onMessage: (message: string, error?: boolean) => void;
};

export default function ImageManager({ product, onChange, onMessage }: Props) {
  const { t } = useLanguage();
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [secondaryFiles, setSecondaryFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [promotingId, setPromotingId] = useState<number | null>(null);
  const currentPrimary = product.images.find((image) => image.primary);
  const selectedCount = (primaryFile ? 1 : 0) + secondaryFiles.length;

  const validateFiles = (files: File[]) => {
    if (files.some((file) => !ACCEPTED_TYPES.has(file.type))) {
      onMessage(t("imageTypeInvalid"), true);
      return false;
    }
    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      onMessage(t("imageTooLarge"), true);
      return false;
    }
    return true;
  };

  const selectPrimary = (file: File | undefined) => {
    if (!file || !validateFiles([file])) return;
    if (!primaryFile && product.images.length + selectedCount >= MAX_IMAGES) {
      onMessage(t("imageLimit"), true);
      return;
    }
    setPrimaryFile(file);
  };

  const addSecondary = (files: File[]) => {
    if (files.length === 0 || !validateFiles(files)) return;

    const existing = new Set(secondaryFiles.map(fileIdentity));
    const uniqueFiles = files.filter((file) => {
      const identity = fileIdentity(file);
      if (existing.has(identity)) return false;
      existing.add(identity);
      return true;
    });
    if (product.images.length + selectedCount + uniqueFiles.length > MAX_IMAGES) {
      onMessage(t("imageLimit"), true);
      return;
    }
    setSecondaryFiles((current) => [...current, ...uniqueFiles]);
  };

  const upload = async () => {
    if (selectedCount === 0) {
      onMessage(t("selectImagesRequired"), true);
      return;
    }

    setIsUploading(true);
    try {
      onChange(await uploadImages(product.id, primaryFile, secondaryFiles));
      onMessage(t("imagesUploaded").replace("{count}", String(selectedCount)));
      setPrimaryFile(null);
      setSecondaryFiles([]);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setIsUploading(false);
    }
  };

  const makePrimary = async (image: AdminImage) => {
    setPromotingId(image.id);
    try {
      onChange(await updateImage(image.id, { imageUrl: image.imageUrl, primary: true }));
      onMessage(t("primaryImageUpdated"));
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setPromotingId(null);
    }
  };

  const remove = async (image: AdminImage) => {
    if (!window.confirm(t("deleteImageConfirm"))) return;

    setDeletingId(image.id);
    try {
      onChange(await deleteImage(image.id));
      onMessage(t("imageDeleted"));
    } catch (error) {
      onMessage(error instanceof Error ? error.message : t("catalogAdminError"), true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-bg-secondary/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-text">{t("productImages")}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t("productImagesDescription")}</p>
        </div>
        <span className="rounded-full bg-bg px-2.5 py-1 text-xs text-text-tertiary">
          {product.images.length}/{MAX_IMAGES}
        </span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-text">{t("mainImage")}</p>
          <label className="group relative flex min-h-52 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-bg transition-colors hover:border-primary">
            <input
              type="file"
              className="sr-only"
              accept={ACCEPTED_FILES}
              onChange={(event) => {
                selectPrimary(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />
            {primaryFile ? (
              <FilePreview file={primaryFile} />
            ) : currentPrimary ? (
              <img src={currentPrimary.imageUrl} alt="" className="h-full min-h-52 w-full object-cover" />
            ) : (
              <UploadPrompt title={t("chooseMainImage")} subtitle={t("imageFileHint")} />
            )}
            <span className="absolute inset-x-3 bottom-3 rounded-md bg-black/65 px-3 py-2 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              {t("chooseMainImage")}
            </span>
          </label>
          {primaryFile && (
            <button type="button" className={`${secondaryButtonClass} mt-2`} onClick={() => setPrimaryFile(null)}>
              <X size={15} /> {t("removeSelectedImage")}
            </button>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-text">{t("secondaryImages")}</p>
          <label className="flex min-h-52 cursor-pointer rounded-xl border-2 border-dashed border-border bg-bg transition-colors hover:border-primary">
            <input
              type="file"
              multiple
              className="sr-only"
              accept={ACCEPTED_FILES}
              onChange={(event) => {
                addSecondary(Array.from(event.target.files ?? []));
                event.currentTarget.value = "";
              }}
            />
            <UploadPrompt title={t("chooseSecondaryImages")} subtitle={t("imageFileHint")} />
          </label>
        </div>
      </div>

      {secondaryFiles.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {secondaryFiles.map((file, index) => (
            <div key={fileIdentity(file)} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-bg">
              <FilePreview file={file} />
              <button
                type="button"
                className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1.5 text-white transition-colors hover:bg-red-600"
                aria-label={t("removeSelectedImage")}
                onClick={() => setSecondaryFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`${primaryButtonClass} mt-4`}
        disabled={isUploading || selectedCount === 0}
        onClick={() => void upload()}
      >
        {isUploading ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={17} />}
        {isUploading ? t("uploadingImages") : t("uploadSelectedImages")}
      </button>

      {product.images.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <h4 className="text-sm font-semibold text-text">{t("savedImages")}</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {product.images.map((image) => (
              <article key={image.id} className="overflow-hidden rounded-lg border border-border bg-bg">
                <div className="relative aspect-[16/10] bg-bg-secondary">
                  <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                  {image.primary && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-white">
                      <Check size={12} /> {t("primaryImage")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2">
                  {!image.primary && (
                    <button
                      type="button"
                      className={`${secondaryButtonClass} flex-1`}
                      disabled={promotingId === image.id}
                      onClick={() => void makePrimary(image)}
                    >
                      {promotingId === image.id ? <LoaderCircle className="animate-spin" size={15} /> : <ImagePlus size={15} />}
                      {t("setPrimaryImage")}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${dangerButtonClass} ${image.primary ? "ml-auto" : ""}`}
                    disabled={deletingId === image.id}
                    onClick={() => void remove(image)}
                  >
                    {deletingId === image.id ? <LoaderCircle className="animate-spin" size={15} /> : <Trash2 size={15} />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function UploadPrompt({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <span className="m-auto flex flex-col items-center p-5 text-center">
      <span className="rounded-full bg-primary/10 p-3 text-primary"><ImagePlus size={24} /></span>
      <span className="mt-3 text-sm font-semibold text-text">{title}</span>
      <span className="mt-1 text-xs text-text-tertiary">{subtitle}</span>
    </span>
  );
}

function FilePreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

function fileIdentity(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}
