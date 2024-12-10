import formidable from "formidable";
import { put } from "@vercel/blob";
import { readFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const BLOB_READ_WRITE_TOKEN = config.BLOB_READ_WRITE_TOKEN;

  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  const form = formidable({
    multiples: false, // Ne permet qu'un seul fichier
    keepExtensions: true, // Conserve les extensions
  });

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      console.log("Fichiers reçus :", files); 

      const fileArray = files.file; 
      if (!fileArray || fileArray.length === 0) {
        reject(new Error("Aucun fichier trouvé"));
        return;
      }

      const file = fileArray[0]; //suelement un fichier
      if (!file || !file.filepath) {
        reject(new Error("Fichier non trouvé ou chemin manquant"));
        return;
      }

      try {
        // Lire le contenu du fichier avec fs/promises
        const fileContent = await readFile(file.filepath);
        const contentType = file.mimetype;

        // Upload vers Vercel Blob
        const blob = await put(file.originalFilename, fileContent, {
          contentType,
          access: "public",
        });

        resolve(blob); // Retourne le blob
      } catch (readOrUploadError) {
        reject(readOrUploadError); // Gère les erreurs
      }
    });
  });
});
