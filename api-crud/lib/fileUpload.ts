import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Configuration des uploads
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'documents')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

// Créer le dossier d'upload s'il n'existe pas
export const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Générer un nom de fichier unique
export const generateUniqueFilename = (originalName: string): string => {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  return `${timestamp}-${random}${extension}`
}

// Valider le fichier
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Vérifier la taille
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` }
  }

  // Vérifier l'extension
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { isValid: false, error: `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` }
  }

  return { isValid: true }
}

// Sauvegarder le fichier
export const saveFile = async (file: File): Promise<{ filename: string; path: string; hash: string }> => {
  await ensureUploadDir()

  const filename = generateUniqueFilename(file.name)
  const filepath = join(UPLOAD_DIR, filename)
  
  // Convertir le fichier en buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Générer un hash du fichier
  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  
  // Sauvegarder le fichier
  await writeFile(filepath, buffer)
  
  // Retourner le chemin relatif pour l'URL
  const relativePath = `/uploads/documents/${filename}`
  
  return {
    filename,
    path: relativePath,
    hash
  }
}

// Extraire le fichier d'une requête FormData
export const extractFileFromRequest = async (request: NextRequest): Promise<{ file: File | null; formData: FormData }> => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    return { file, formData }
  } catch (error) {
    console.error('Error extracting file from request:', error)
    return { file: null, formData: new FormData() }
  }
}
