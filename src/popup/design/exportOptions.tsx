import { FileJson, FileSpreadsheet, FileText } from 'lucide-react'
import type { DropdownOption } from '@/popup/components/ui/Dropdown'

const iconClass = 'shrink-0 text-text-tertiary'

export function buildExportDropdownOptions(): DropdownOption[] {
  return [
    { value: 'json', label: 'JSON', icon: <FileJson size={14} className={iconClass} /> },
    { value: 'csv', label: 'CSV', icon: <FileSpreadsheet size={14} className={iconClass} /> },
    { value: 'txt', label: 'TXT', icon: <FileText size={14} className={iconClass} /> },
  ]
}
