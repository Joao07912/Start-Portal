// GitHub Storage - Sistema de armazenamento gratuito
const GITHUB_CONFIG = {
    // SUBSTITUA PELOS SEUS DADOS:
    owner: 'SEU_USUARIO_GITHUB',        // Ex: 'joaosilva'
    repo: 'portal-files',               // Nome do repositório que você criará
    token: 'SEU_TOKEN_GITHUB',          // Token de acesso pessoal
    branch: 'main'
};

const GitHubStorage = {
    // Upload de arquivo para GitHub
    async uploadFile(file, fileName) {
        try {
            console.log('Fazendo upload para GitHub:', fileName);
            
            // Converter arquivo para Base64
            const base64Content = await this.fileToBase64(file);
            const content = base64Content.split(',')[1]; // Remove "data:type;base64,"
            
            // Fazer upload via API do GitHub
            const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/files/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Upload: ${fileName}`,
                    content: content,
                    branch: GITHUB_CONFIG.branch
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro no upload: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Retornar URL de download
            const downloadUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/files/${fileName}`;
            
            console.log('Upload concluído:', downloadUrl);
            return downloadUrl;
            
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    },
    
    // Converter arquivo para Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    
    // Deletar arquivo do GitHub
    async deleteFile(fileName) {
        try {
            // Primeiro, obter o SHA do arquivo
            const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/files/${fileName}`, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                }
            });
            
            if (!getResponse.ok) {
                console.log('Arquivo não encontrado no GitHub');
                return;
            }
            
            const fileData = await getResponse.json();
            
            // Deletar o arquivo
            const deleteResponse = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/files/${fileName}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Delete: ${fileName}`,
                    sha: fileData.sha,
                    branch: GITHUB_CONFIG.branch
                })
            });
            
            if (!deleteResponse.ok) {
                throw new Error(`Erro ao deletar: ${deleteResponse.status}`);
            }
            
            console.log('Arquivo deletado do GitHub:', fileName);
            
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
        }
    }
};