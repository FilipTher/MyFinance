import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-export.html',
  styleUrl: './import-export.css'
})
export class ImportExport {
  activeTab: 'import' | 'export' = 'import';
  
  fileName: string | null = null;

  setTab(tab: 'import' | 'export') {
    this.activeTab = tab;
    this.fileName = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
    }
  }

  processFile() {
    if (this.fileName) {
      alert(`Simulace: Soubor '${this.fileName}' byl úspěšně nahrán!`);
      this.fileName = null;
    }
  }
}