import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        // 1. Buscar si el término de búsqueda ya existe
        const result = await databases.listDocuments(
            DATABASE_ID, 
            COLLECTION_ID, 
            [Query.equal('searchTerm', searchTerm)]
        );

        // 2. Si existe, actualizar el contador
        if(result.documents.length > 0) { // Corregido: 'lenght' -> 'length'
            const doc = result.documents[0];
            await databases.updateDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                doc.$id, 
                {
                    count: doc.count + 1,
                    movie_id: movie.id, // Actualizar también estos campos por si cambiaron
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                }
            );
        } else {
            // 3. Si no existe, crear nuevo documento
            await databases.createDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                ID.unique(), 
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    title: movie.title // Añadido: guardar título para fácil referencia
                }
            );
        }
    } catch (error) {
        console.error("Error updating search count:", error); // Mejor mensaje de error
        throw error; // Relanzar el error para manejo superior
    }
};