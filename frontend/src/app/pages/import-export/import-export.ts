import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { TransactionsService } from '../../services/transactions.service';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-export.html',
  styleUrl: './import-export.css'
})
export class ImportExport implements OnInit {
  activeTab: 'import' | 'export' = 'import';
  
  fileName: string | null = null;
  selectedFile: File | null = null;
  isExporting: boolean = false;
  isImporting: boolean = false;

  // Import dialogue properties
  importDialogueOpen: boolean = false;
  pendingImportData: any = null;

  constructor(
    private authService: AuthService,
    private transactionsService: TransactionsService,
    private categoriesService: CategoriesService,
    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  setTab(tab: 'import' | 'export') {
    this.activeTab = tab;
    this.fileName = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.selectedFile = file;
    }
  }

  processFile() {
    if (!this.selectedFile) {
      alert('Prosím, vyberte soubor.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate the imported file structure
        if (!importedData.data || !importedData.data.transactions || !importedData.data.categories) {
          alert('Neplatný formát souboru. Prosím, zkontrolujte, že se jedná o správný export soubor.');
          return;
        }

        // Show custom dialogue
        this.pendingImportData = importedData;
        this.importDialogueOpen = true;
      } catch (error) {
        console.error('Chyba při čtení souboru:', error);
        alert('Chyba při čtení souboru. Prosím, zkontrolujte formát.');
      }
    };
    reader.readAsText(this.selectedFile);
  }

  onImportChoice(choice: 'replace' | 'add' | 'cancel') {
    this.importDialogueOpen = false;

    if (choice === 'cancel') {
      this.pendingImportData = null;
      return;
    }

    if (this.pendingImportData) {
      if (choice === 'replace') {
        this.importWithReplace(this.pendingImportData);
      } else if (choice === 'add') {
        this.importWithAdd(this.pendingImportData);
      }
    }

    this.pendingImportData = null;
  }

  importWithReplace(importedData: any) {
    this.isImporting = true;

    const userId = this.authService.currentUserId;
    if (!userId) {
      alert('Uživatel není přihlášen.');
      this.isImporting = false;
      return;
    }

    // First delete all current transactions and categories
    this.transactionsService.getTransactions().subscribe({
      next: (currentTransactions: any[]) => {
        if (currentTransactions.length > 0) {
          const transactionIds = currentTransactions.map((t: any) => t.id);
          this.transactionsService.deleteTransactions(transactionIds).subscribe({
            next: () => {
              this.deleteCategoriesThenImport(importedData);
            },
            error: (err) => {
              console.error('Chyba při mazání starých dat:', err);
              alert('Chyba při mazání starých dat.');
              this.isImporting = false;
            }
          });
        } else {
          this.deleteCategoriesThenImport(importedData);
        }
      },
      error: (err) => {
        console.error('Chyba při načítání aktuálních dat:', err);
        alert('Chyba při načítání aktuálních dat.');
        this.isImporting = false;
      }
    });
  }

  deleteCategoriesThenImport(importedData: any) {
    this.categoriesService.getCategories().subscribe({
      next: (categories: any[]) => {
        if (categories.length > 0) {
          let categoryDeleted = 0;
          categories.forEach(category => {
            this.categoriesService.deleteCategory(category.id).subscribe({
              next: () => {
                categoryDeleted++;
                if (categoryDeleted === categories.length) {
                  this.importNewData(importedData);
                }
              },
              error: (err) => {
                console.error('Chyba při mazání kategorie:', err);
                categoryDeleted++;
                if (categoryDeleted === categories.length) {
                  this.importNewData(importedData);
                }
              }
            });
          });
        } else {
          this.importNewData(importedData);
        }
      },
      error: (err) => {
        console.error('Chyba při načítání kategorií:', err);
        this.importNewData(importedData);
      }
    });
  }

  importWithAdd(importedData: any) {
    this.isImporting = true;
    this.importNewData(importedData);
  }

  importNewData(importedData: any) {
    const importedTransactions = importedData.data.transactions || [];
    const importedCategories = importedData.data.categories || [];

    if (importedCategories.length === 0 && importedTransactions.length === 0) {
      alert('Soubor neobsahuje žádná data k importu.');
      this.isImporting = false;
      this.fileName = null;
      this.selectedFile = null;
      return;
    }

    // Fetch existing categories first to check for duplicates
    this.categoriesService.getCategories().subscribe({
      next: (existingCategories: any[]) => {
        this.processCategoriesWithDuplicateCheck(importedData, existingCategories);
      },
      error: (err) => {
        console.error('Chyba při načítání stávajících kategorií:', err);
        // Continue anyway with empty existing categories
        this.processCategoriesWithDuplicateCheck(importedData, []);
      }
    });
  }

  processCategoriesWithDuplicateCheck(importedData: any, existingCategories: any[]) {
    const importedTransactions = importedData.data.transactions || [];
    const importedCategories = importedData.data.categories || [];

    // Create a mapping from old category IDs to new category IDs
    const categoryIdMap: { [oldId: number]: number } = {};
    let categoriesCompleted = 0;

    if (importedCategories.length === 0) {
      this.importTransactionsWithCategoryMapping(importedTransactions, categoryIdMap);
    } else {
      importedCategories.forEach((category: any) => {
        const existingCategory = existingCategories.find(
          (ec: any) => ec.name === category.name && ec.type === category.type
        );

        if (existingCategory) {
          categoryIdMap[category.id] = existingCategory.id;
          categoriesCompleted++;
          if (categoriesCompleted === importedCategories.length) {
            this.importTransactionsWithCategoryMapping(importedTransactions, categoryIdMap);
          }
        } else {
          const categoryData = {
            name: category.name,
            type: category.type || 'transaction',
            categoryFor: category.categoryFor || 'transaction',
            icon: category.icon || 'category'
          };

          this.categoriesService.createCategory(categoryData).subscribe({
            next: (newCategory: any) => {
              categoryIdMap[category.id] = newCategory.id;
              categoriesCompleted++;
              if (categoriesCompleted === importedCategories.length) {
                this.importTransactionsWithCategoryMapping(importedTransactions, categoryIdMap);
              }
            },
            error: (err) => {
              console.error('Chyba při importu kategorie:', err);
              categoriesCompleted++;
              if (categoriesCompleted === importedCategories.length) {
                this.importTransactionsWithCategoryMapping(importedTransactions, categoryIdMap);
              }
            }
          });
        }
      });
    }
  }

  importTransactionsWithCategoryMapping(importedTransactions: any[], categoryIdMap: { [oldId: number]: number }) {
    let completed = 0;
    let failed = 0;
    const total = importedTransactions.length;
    const categoryCount = Object.keys(categoryIdMap).length;

    if (total === 0) {
      this.finishImport(categoryCount, 0);
      return;
    }

    // Import transactions with mapped category IDs
    importedTransactions.forEach((transaction: any) => {
      const oldCategoryId = transaction.category?.id || transaction.category;
      const newCategoryId = categoryIdMap[oldCategoryId] || oldCategoryId;

      const transactionData = {
        amount: transaction.amount,
        description: transaction.description || '',
        date: transaction.date,
        category: newCategoryId,
        type: transaction.type,
        userId: this.authService.currentUserId
      };

      this.transactionsService.createTransaction(transactionData).subscribe({
        next: () => {
          completed++;
          if (completed + failed === total) {
            this.finishImport(completed + categoryCount, failed);
          }
        },
        error: (err) => {
          console.error('Chyba při importu transakce:', err);
          failed++;
          if (completed + failed === total) {
            this.finishImport(completed + categoryCount, failed);
          }
        }
      });
    });
  }

  finishImport(completed: number, failed: number) {
    this.isImporting = false;
    this.fileName = null;
    this.selectedFile = null;

    if (failed === 0) {
      alert(`Import úspěšný!\nNačteno: ${completed} položek`);
    } else {
      alert(`Import skončil s chybami.\nÚspěšně: ${completed}\nChyby: ${failed}`);
    }
  }

  exportData() {
    this.isExporting = true;

    const userId = this.authService.currentUserId;
    if (!userId) {
      alert('Uživatel není přihlášen.');
      this.isExporting = false;
      return;
    }

    // Fetch transactions and categories
    Promise.all([
      this.transactionsService.getTransactions().toPromise(),
      this.categoriesService.getCategories().toPromise()
    ]).then(([transactions, categories]) => {
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId,
        userEmail: this.authService.currentUserName,
        userName: this.authService.currentUserFullName || this.authService.currentUserName,
        initialBalance: this.authService.getBalance(),
        version: '1.0',
        data: {
          transactions: transactions || [],
          categories: categories || []
        }
      };

      // Download as JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myfinance-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Data byla úspěšně exportována!');
      this.isExporting = false;
    }).catch((err) => {
      console.error('Chyba při exportu dat:', err);
      alert('Chyba při exportu dat.');
      this.isExporting = false;
    });
  }
}