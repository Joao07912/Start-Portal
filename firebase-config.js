// Configuração do Firebase
const firebaseConfig = {
    // Substitua pelas suas credenciais do Firebase
    apiKey: "sua-api-key-aqui",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "123456789",
    appId: "sua-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências do Firebase
const db = firebase.firestore();
const storage = firebase.storage();

// Configurações das coleções
const COLLECTIONS = {
    SCHOOLS: 'schools',
    STUDENTS: 'students',
    EXERCISES: 'exercises',
    MATERIALS: 'materials',
    EVENTS: 'events',
    ACTIVITIES: 'activities'
};

// Funções utilitárias do Firebase
const FirebaseUtils = {
    // Adicionar documento
    async addDocument(collection, data) {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Erro ao adicionar documento:', error);
            throw error;
        }
    },

    // Buscar documentos
    async getDocuments(collection, orderBy = 'createdAt', limit = null) {
        try {
            let query = db.collection(collection).orderBy(orderBy, 'desc');
            if (limit) query = query.limit(limit);
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
            return [];
        }
    },

    // Atualizar documento
    async updateDocument(collection, id, data) {
        try {
            await db.collection(collection).doc(id).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erro ao atualizar documento:', error);
            return false;
        }
    },

    // Deletar documento
    async deleteDocument(collection, id) {
        try {
            await db.collection(collection).doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erro ao deletar documento:', error);
            return false;
        }
    },

    // Upload de arquivo
    async uploadFile(file, path) {
        try {
            const storageRef = storage.ref().child(path);
            const snapshot = await storageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    },

    // Buscar com filtro
    async searchDocuments(collection, field, value) {
        try {
            const snapshot = await db.collection(collection)
                .where(field, '>=', value)
                .where(field, '<=', value + '\uf8ff')
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro na busca:', error);
            return [];
        }
    }
};

// Dados de exemplo para desenvolvimento (remover em produção)
const SAMPLE_DATA = {
    schools: [
        {
            name: "Escola Técnica ABC",
            address: "Rua das Flores, 123",
            phone: "(11) 1234-5678",
            email: "contato@escolaabc.edu.br",
            students: 45,
            score: 95.5
        },
        {
            name: "Colégio XYZ",
            address: "Av. Principal, 456",
            phone: "(11) 8765-4321",
            email: "info@colegioxyz.edu.br",
            students: 38,
            score: 89.2
        }
    ],
    exercises: []
};

// Inicializar dados de exemplo (apenas para desenvolvimento)
async function initSampleData() {
    try {
        // Verificar se já existem dados
        const schools = await FirebaseUtils.getDocuments(COLLECTIONS.SCHOOLS);
        if (schools.length === 0) {
            console.log('Inicializando dados de exemplo...');
            
            // Adicionar escolas de exemplo
            for (const school of SAMPLE_DATA.schools) {
                await FirebaseUtils.addDocument(COLLECTIONS.SCHOOLS, school);
            }
            
            // Adicionar exercícios de exemplo
            for (const exercise of SAMPLE_DATA.exercises) {
                await FirebaseUtils.addDocument(COLLECTIONS.EXERCISES, exercise);
            }
            
            console.log('Dados de exemplo inicializados!');
        }
    } catch (error) {
        console.error('Erro ao inicializar dados:', error);
    }
}