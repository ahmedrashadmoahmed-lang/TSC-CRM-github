# 🤖 How to Add Your Gemini API Key

## Quick Setup (2 minutes)

### Step 1: Get Your API Key
1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### Step 2: Add to Environment File
1. Open `.env.local` file in the project root
2. Find the line: `GEMINI_API_KEY=""`
3. Paste your key between the quotes:
   ```
   GEMINI_API_KEY="your-actual-api-key-here"
   ```
4. Save the file

### Step 3: Restart the Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Chatbot
1. Open http://localhost:3000
2. Click the 🤖 button in the bottom-left
3. Ask: "كم إجمالي المبيعات؟"
4. You should get a response!

---

## Alternative: OpenAI

If you prefer OpenAI instead:

1. Get API key from: https://platform.openai.com/api-keys
2. Install OpenAI package:
   ```bash
   npm install openai
   ```
3. Update `src/app/api/chat/route.js` to use OpenAI instead of Gemini

---

## Troubleshooting

### "API key not configured" error
- Make sure you added the key to `.env.local`
- Restart the dev server
- Check there are no extra spaces

### "Invalid API key" error
- Verify the key is correct
- Make sure you copied the entire key
- Try generating a new key

---

## Need Help?
The chatbot will show helpful error messages if something is wrong!
