// Firebase Configuration - VERSÃO GRATUITA (sem Storage)
const firebaseConfig = {
    apiKey: "AIzaSyDeB9Uwy0Zd29S3fUTDfThL5Ei3x93adyE",
    authDomain: "portal-ambiente.firebaseapp.com",
    projectId: "portal-ambiente",
    storageBucket: "portal-ambiente.firebasestorage.app",
    messagingSenderId: "943609816543",
    appId: "1:943609816543:web:e21235e9f264e30b3cd06a"
};

// Initialize Firebase (apenas Firestore)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Collections
const COLLECTIONS = {
    SCHOOLS: 'schools',
    EXERCISES: 'exercises',
    MATERIALS: 'materials', 
    EVENTS: 'events',
    ACTIVITIES: 'activities',
    STUDENTS: 'students'
};

// Database Helper - SEM Storage
const DB = {
    async save(collection, data, id = null) {
        try {
            const docData = { ...data, updatedAt: new Date().toISOString() };
            
            // Verificar tamanho do documento (Firebase tem limite de 1MB)
            const docSize = JSON.stringify(docData).length;
            if (docSize > 900000) { // 900KB para margem de segurança
                throw new Error('Documento muito grande. Reduza o tamanho da imagem.');
            }
            
            if (id) {
                await db.collection(collection).doc(id).set(docData);
                return id;
            } else {
                const docRef = await db.collection(collection).add({
                    ...docData, createdAt: new Date().toISOString()
                });
                return docRef.id;
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            throw error;
        }
    },

    async getAll(collection) {
        try {
            const snapshot = await db.collection(collection).get();
            const data = {};
            snapshot.forEach(doc => {
                data[doc.id] = { id: doc.id, ...doc.data() };
            });
            return data;
        } catch (error) {
            console.error('Erro ao buscar:', error);
            return {};
        }
    },

    async delete(collection, id) {
        try {
            console.log(`Deletando ${id} da coleção ${collection}`);
            await db.collection(collection).doc(id).delete();
            console.log(`${id} deletado com sucesso do Firebase`);
            return true;
        } catch (error) {
            console.error('Erro ao deletar:', error);
            if (error.code === 'resource-exhausted') {
                throw new Error('Documento muito grande para ser processado.');
            }
            throw error;
        }
    }
};



// Função para verificar se Firebase está conectado
function isFirebaseConnected() {
    return typeof firebase !== 'undefined' && firebase.firestore;
}