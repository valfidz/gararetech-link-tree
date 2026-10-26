import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.question('Masukkan kata sandi admin baru: ', (password) => {
  if (!password || password.trim().length === 0) {
    console.error('Kata sandi tidak boleh kosong!')
    rl.close()
    process.exit(1)
  }

  const saltRounds = 10
  const hash = bcrypt.hashSync(password.trim(), saltRounds)
  console.log('\n--- Hasil Hash Kata Sandi ---')
  console.log(hash)
  console.log('-----------------------------')
  console.log('Salin teks hash di atas ke ADMIN_PASSWORD_HASH di file .env atau Netlify Environment Variables.\n')
  rl.close()
})
