# 🚀 Deploy no Render - Guia Completo

## ✅ Sistema Keep-Alive Configurado

Sua aplicação já está configurada com o sistema de keep-alive interno que impede a hibernação no plano gratuito do Render.

### Como Funciona

- ✓ Endpoint `/health` criado
- ✓ Ping automático a cada 14 minutos
- ✓ Compatível com o plano gratuito do Render (750h/mês)

---

## 📋 Passo a Passo para Deploy

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit com keep-alive para Render"

# Criar repositório no GitHub/GitLab
# Push do código
git remote add origin <seu-repositorio-url>
git branch -M main
git push -u origin main
```

### 2. Criar Web Service no Render

1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório (GitHub/GitLab)
4. Configure:

**Build Command:**
```
npm install
```

**Start Command:**
```
npm run start
```

### 3. Configurar Variáveis de Ambiente

No painel do Render, adicione estas variáveis de ambiente:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NODE_ENV` | `production` | Modo de produção |
| `RENDER_EXTERNAL_URL` | Será preenchido automaticamente | URL do seu app |

**Importante:** Após o primeiro deploy, copie a URL do seu app (exemplo: `https://seu-app.onrender.com`) e adicione/atualize:

| Nome | Valor |
|------|-------|
| `RENDER_EXTERNAL_URL` | `https://seu-app.onrender.com` |

### 4. Deploy

Clique em **"Create Web Service"**. O Render vai:

1. Clonar seu repositório
2. Instalar dependências (`npm install`)
3. Iniciar o servidor (`npm run start`)
4. Disponibilizar sua app em `https://seu-app.onrender.com`

---

## 🔍 Verificar se Está Funcionando

### Teste o Endpoint de Health

```bash
curl https://seu-app.onrender.com/health
```

Resposta esperada:
```json
{
  "status": "alive",
  "timestamp": "2025-10-21T20:57:40.123Z",
  "uptime": 1234.56
}
```

### Verificar Logs do Keep-Alive

No painel do Render, acesse **"Logs"**. Você deve ver mensagens como:

```
serving on port 5000
Keep-alive ativado: ping a cada 14 minutos para https://seu-app.onrender.com/health
✓ Keep-alive ping enviado com sucesso
```

---

## ⚙️ Informações Importantes

### Plano Gratuito

- **750 horas/mês** (suficiente para 1 app rodando 24/7)
- **Hibernação após 15 min** de inatividade (evitado pelo keep-alive)
- **500 MB RAM**
- **Bandwidth limitado**

### Limitações

- Se você tiver múltiplos serviços, as 750 horas são compartilhadas
- Para apps em produção com tráfego alto, considere o plano pago ($7/mês)

### Próximos Passos

1. Adicione um domínio customizado (se desejar)
2. Configure SSL/TLS (incluído automaticamente)
3. Monitore os logs regularmente

---

## 🐛 Troubleshooting

### App ainda está hibernando?

Verifique se:
- A variável `RENDER_EXTERNAL_URL` está configurada corretamente
- Os logs mostram "Keep-alive ping enviado com sucesso"
- O endpoint `/health` está acessível

### Como forçar redeploy?

No painel do Render:
1. Vá em **"Manual Deploy"**
2. Clique em **"Deploy latest commit"**

---

## 📞 Suporte

- [Documentação Render](https://render.com/docs)
- [Community Forum](https://community.render.com)

---

**✅ Sua aplicação está pronta para deploy no Render sem hibernação!**
