import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from '../../services/categories.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {

  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  newCategory = {
    name: '',
    type: 'expense'
  };

  constructor(private categoriesService: CategoriesService, private cd: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.loadCategories();
    }
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.error('Chyba při načítání kategorií:', err);
        this.cd.markForCheck();
      }
    });
  }

  openModal() {
    this.isEditing = false;
    this.editingId = null;
    this.newCategory = { name: '', type: 'expense' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.newCategory = { name: '', type: 'expense' };
  }

  openEditModal(category: Category) {
    this.isEditing = true;
    this.editingId = category.id || null;
    this.newCategory = { name: category.name, type: category.type };
    this.showModal = true;
  }

  onSubmit() {
    if (!this.newCategory.name.trim()) {
      alert('Název kategorie nemůže být prázdný');
      return;
    }

    if (this.isEditing && this.editingId) {
      // Update existing category
      this.categoriesService.updateCategory(this.editingId, this.newCategory).subscribe({
        next: () => {
          alert('Kategorie byla aktualizována!');
          this.loadCategories();
          this.closeModal();
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při aktualizaci kategorie:', err);
          alert('Chyba při aktualizaci kategorie');
          this.cd.markForCheck();
        }
      });
    } else {
      // Create new category
      this.categoriesService.createCategory(this.newCategory).subscribe({
        next: () => {
          alert('Kategorie byla vytvořena!');
          this.loadCategories();
          this.closeModal();
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při vytváření kategorie:', err);
          alert('Chyba při vytváření kategorie');
          this.cd.markForCheck();
        }
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Opravdu chceš smazat tuto kategorii?')) {
      this.categoriesService.deleteCategory(id).subscribe({
        next: () => {
          alert('Kategorie byla smazána!');
          this.loadCategories();
          this.cd.markForCheck();
        },
        error: (err) => {
          console.error('Chyba při mazání kategorie:', err);
          alert('Chyba při mazání kategorie');
          this.cd.markForCheck();
        }
      });
    }
  }
}
