<template>
  <div>
    <h1>Upload un fichier</h1>
    <form @submit.prevent="uploadFile">
      <input type="file" @change="onFileChange" />
      <button type="submit">Uploader</button>
    </form>
    <div v-if="fileUrl">
      <h2>Fichier uploadé avec succès :</h2>
      <a :href="fileUrl" target="_blank">{{ fileUrl }}</a>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFile: null,
      fileUrl: null,
    };
  },
  methods: {
    // Capture le fichier sélectionné
    onFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    // Upload le fichier
    async uploadFile() {
      if (!this.selectedFile) {
        alert("Veuillez sélectionner un fichier avant de soumettre.");
        return;
      }

      try {
        // Crée un objet FormData pour envoyer le fichier
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        // Envoie la requête à l'API
        const response = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        });

        // Vérifie la réponse
        if (!response.ok) {
          throw new Error(`Erreur lors de l'upload : ${response.statusText}`);
        }

        const result = await response.json();
        this.fileUrl = result.url; // Affiche l'URL du fichier retourné
      } catch (error) {
        console.error("Erreur lors de l'upload :", error);
        alert("Une erreur est survenue lors de l'upload du fichier.");
      }
    },
  },
};
</script>

<style scoped>
h1 {
  font-size: 24px;
  margin-bottom: 16px;
}
form {
  margin-bottom: 24px;
}
button {
  margin-top: 8px;
}
</style>
