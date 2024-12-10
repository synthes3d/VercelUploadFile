import formidable from "formidable";
import { put } from "@vercel/blob";
import { readFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const BLOB_READ_WRITE_TOKEN = config.BLOB_READ_WRITE_TOKEN;

  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  // Configurer formidable
  const form = formidable({
    multiples: false, // Un seul fichier
    keepExtensions: true, // Conserve les extensions
  });

  return new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }

      console.log("Fichiers reçus :", files); // Inspectez les fichiers reçus

      const file = files.file; // Assurez-vous que le champ correspond au FormData envoyé
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
