import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GoalsService, Goal } from '../../services/goals.service';
import { CategoriesService } from '../../services/categories.service';
import { AuthService } from '../../services/auth.service';

interface GoalCategory {
  nazev: string;
  cile: any[];
}

interface CategoryForm {
  name: string;
  type: string;
  icon: string;
}

interface GoalForm {
  id?: number;
  name: string;
  categoryName: string;
  icon: string;
  targetAmount: number;
  savedAmount: number;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.html',
  styleUrl: './goals.css'
})
export class Goals implements OnInit, OnDestroy {
  
  kategorieCilu: GoalCategory[] = [];
  loading = true;
  isSubmitting = false;
  isDeleting = false;

  showCategoryModal = false;
  showGoalModal = false;

  categoryForm: CategoryForm = { name: '', type: 'expense', icon: 'savings' };
  goalForm: GoalForm = { name: '', categoryName: '', icon: 'card_giftcard', targetAmount: 0, savedAmount: 0 };

  availableIcons = ['savings', 'card_giftcard', 'home', 'school', 'directions_car', 'flight', 'shopping_cart', 'local_hospital', 'beach_access'];
  categories: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private goalsService: GoalsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.loadGoals();
      this.loadCategories();
    }

    // Subscribe to login state changes
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.loadGoals();
          this.loadCategories();
        } else {
          // Clear data when logging out
          this.kategorieCilu = [];
          this.categories = [];
          this.loading = true;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadGoals(): void {
    this.goalsService.getGoals().subscribe({
      next: (goals: Goal[]) => {
        this.kategorieCilu = this.groupGoalsByCategory(goals);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading goals:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories('goal').subscribe({
      next: (categories: any[]) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  openCategoryModal(): void {
    this.categoryForm = { name: '', type: 'expense', icon: 'savings' };
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  openGoalModal(): void {
    this.goalForm = { name: '', categoryName: '', icon: 'card_giftcard', targetAmount: 0, savedAmount: 0 };
    this.showGoalModal = true;
  }

  closeGoalModal(): void {
    this.showGoalModal = false;
  }

  editGoal(goal: any): void {
    this.goalForm = {
      id: goal.id,
      name: goal.nazev,
      categoryName: goal.categoryName,
      icon: goal.ikona,
      targetAmount: goal.cil,
      savedAmount: goal.nasetreno
    };
    this.showGoalModal = true;
  }

  deleteGoal(goal: any): void {
    if (this.isDeleting || !confirm(`Opravdu chcete smazat cíl "${goal.nazev}"?`)) return;
    
    this.isDeleting = true;
    this.goalsService.deleteGoal(goal.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.loadGoals();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting goal:', error);
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(categoryName: string): void {
    if (this.isDeleting || !confirm(`Opravdu chcete smazat kategorii "${categoryName}"? Všechny cíle v této kategorii budou smazány.`)) return;
    
    this.isDeleting = true;
    // Find category by name and delete it
    this.categoriesService.getCategories('goal').subscribe({
      next: (categories: any[]) => {
        const category = categories.find(c => c.name === categoryName);
        if (category) {
          this.categoriesService.deleteCategory(category.id).subscribe({
            next: () => {
              this.loadGoals();
              this.loadCategories();
              this.isDeleting = false;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Error deleting category:', error);
              this.isDeleting = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          console.error('Category not found:', categoryName);
          this.isDeleting = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isDeleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitCategory(): void {
    if (this.isSubmitting || !this.categoryForm.name.trim()) return;
    
    this.isSubmitting = true;
    this.categoriesService.createCategory({
      name: this.categoryForm.name,
      type: this.categoryForm.type,
      icon: this.categoryForm.icon,
      categoryFor: 'goal'
    }).subscribe({
      next: () => {
        this.loadCategories();
        this.isSubmitting = false;
        this.closeCategoryModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitGoal(): void {
    if (this.isSubmitting || !this.goalForm.name.trim() || !this.goalForm.categoryName || this.goalForm.targetAmount <= 0) return;
    
    this.isSubmitting = true;
    
    if (this.goalForm.id) {
      // Update existing goal
      this.goalsService.updateGoal(this.goalForm.id, {
        name: this.goalForm.name,
        categoryName: this.goalForm.categoryName,
        icon: this.goalForm.icon,
        targetAmount: this.goalForm.targetAmount,
        savedAmount: this.goalForm.savedAmount
      }).subscribe({
        next: () => {
          this.loadGoals();
          this.isSubmitting = false;
          this.closeGoalModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error updating goal:', error);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new goal
      this.goalsService.createGoal({
        name: this.goalForm.name,
        categoryName: this.goalForm.categoryName,
        icon: this.goalForm.icon,
        targetAmount: this.goalForm.targetAmount,
        savedAmount: this.goalForm.savedAmount
      }).subscribe({
        next: () => {
          this.loadGoals();
          this.isSubmitting = false;
          this.closeGoalModal();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error creating goal:', error);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private groupGoalsByCategory(goals: Goal[]): GoalCategory[] {
    const grouped = new Map<string, any[]>();

    goals.forEach(goal => {
      const categoryName = goal.categoryName;
      if (!grouped.has(categoryName)) {
        grouped.set(categoryName, []);
      }
      grouped.get(categoryName)!.push({
        id: goal.id,
        nazev: goal.name,
        categoryName: goal.categoryName,
        ikona: goal.icon,
        nasetreno: goal.savedAmount,
        cil: goal.targetAmount
      });
    });

    const result: GoalCategory[] = [];
    grouped.forEach((cile, nazev) => {
      result.push({ nazev, cile });
    });

    return result;
  }

  getProcento(nasetreno: number, cil: number): number {
    const proc = (nasetreno / cil) * 100;
    return proc > 100 ? 100 : Math.round(proc);
  }
}