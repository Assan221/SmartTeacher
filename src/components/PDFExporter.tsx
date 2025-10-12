'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PDFExporterProps {
  content: string
  title: string
  className?: string
}

export default function PDFExporter({ content, title, className = '' }: PDFExporterProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // Функция для создания понятного названия файла
  const createFileName = (title: string) => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    
    // Создаем понятное название на основе типа материала
    let fileName = 'SmartUstaz_'
    
    if (title.toLowerCase().includes('план урока') || title.toLowerCase().includes('lesson')) {
      fileName += 'План_урока_'
    } else if (title.toLowerCase().includes('презентация') || title.toLowerCase().includes('presentation')) {
      fileName += 'Презентация_'
    } else if (title.toLowerCase().includes('тест') || title.toLowerCase().includes('test')) {
      fileName += 'Тест_'
    } else if (title.toLowerCase().includes('домашнее') || title.toLowerCase().includes('homework')) {
      fileName += 'Домашнее_задание_'
    } else {
      fileName += 'Материал_'
    }
    
    fileName += `${dateStr}_${timeStr}`
    return fileName
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Создаем временный HTML элемент для рендеринга
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '800px'
      tempDiv.style.padding = '40px'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '14px'
      tempDiv.style.lineHeight = '1.6'
      tempDiv.style.color = '#000'
      tempDiv.style.backgroundColor = '#fff'
      
      // Создаем HTML контент с правильной кодировкой
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 24px; margin: 0 0 10px 0;">SmartUstaz</h1>
          <h2 style="color: #374151; font-size: 18px; margin: 0 0 20px 0;">Образовательный помощник для учителей</h2>
          <hr style="border: 2px solid #2563eb; margin: 20px 0;">
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 10px 0;">${title}</h3>
          <p style="color: #6b7280; font-size: 12px; margin: 0;">Создано: ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU')}</p>
        </div>
        
        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
        
        <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6;">
          ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Создано с помощью SmartUstaz AI</p>
          <p>Образовательный помощник для учителей</p>
        </div>
      `
      
      document.body.appendChild(tempDiv)
      
      // Конвертируем HTML в canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      // Удаляем временный элемент
      document.body.removeChild(tempDiv)
      
      // Создаем PDF из canvas
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Сохраняем PDF с понятным названием
      const fileName = createFileName(title)
      pdf.save(`${fileName}.pdf`)
      
    } catch (error) {
      console.error('Ошибка при создании PDF:', error)
      alert('Не удалось создать PDF файл')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? 'Создание PDF...' : '📄 Скачать PDF'}
    </button>
  )
}
