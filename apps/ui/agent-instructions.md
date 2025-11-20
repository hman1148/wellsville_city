# Angular UI Construction Guide for AI Agents

## Project Overview

This guide provides detailed instructions for constructing Angular UI applications following a specific architectural pattern using NgrX Signal Store, Angular services, and PrimeNG components.

## Table of Contents

1. [Package Management](#package-management)
2. [Architecture Pattern](#architecture-pattern)
3. [Type System](#type-system)
4. [Project Structure](#project-structure)
5. [Service Layer](#service-layer)
6. [Store Layer](#store-layer)
7. [Component Layer](#component-layer)
8. [Routing and State Management](#routing-and-state-management)
9. [PrimeNG Integration](#primeng-integration)
10. [File Organization](#file-organization)
11. [Code Examples](#code-examples)

---

## Package Management

**CRITICAL**: Always use `yarn` for all package management operations. Always follow WCAG standards

```bash
# Installing dependencies
yarn install

# Adding new packages
yarn add <package-name>

# Adding dev dependencies
yarn add -D <package-name>

# Running scripts
yarn start
yarn build
yarn test
```

---

## Architecture Pattern

### Core Principles

1. **Service Layer**: Services make HTTP calls and interact with external APIs
2. **Store Layer**: Stores manage application state and call services to populate data
3. **Component Layer**: Components only read from stores and manage UI logic
4. **Route-Based State Management**: Route changes trigger store methods to load data
5. **Unidirectional Data Flow**: Route Change → Store Method → Service Call → Store Update → Component Reads

### Data Flow Diagram

```
Route Change
    ↓
Store Method Called (via resolver or ngOnInit)
    ↓
Service Method Called
    ↓
HTTP Request Made
    ↓
Store State Updated
    ↓
Component Reads from Store (via signals)
    ↓
UI Updates
```

---

## Type System

### Type vs Interface Rule

**ALWAYS use `type` declarations, NEVER use `interface` declarations.**

```typescript
// ✅ CORRECT
export type User = {
  id: string;
  name: string;
  email: string;
};

export type UserStoreState = {
  isLoading: boolean;
  isEntitiesLoaded: boolean;
  currentUser: User;
};

// ❌ INCORRECT
interface User {
  id: string;
  name: string;
}
```

### Type Definition Requirements

- All models must be defined as types
- All store states must be defined as types
- All API request/response types must be defined as types
- Include initial value factory functions for complex types

```typescript
// Type definition with initial value factory
export type Stock = {
  tickerSymbol: string;
  companyName: string;
  currentPrice: number;
  marketCap: number;
};

export const initialStock = (): Stock => ({
  tickerSymbol: '',
  companyName: '',
  currentPrice: 0,
  marketCap: 0,
});
```

---

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   ├── index.ts
│   │   ├── stock.model.ts
│   │   ├── user.model.ts
│   │   └── api-response.model.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── stocks/
│   │   │   ├── index.ts
│   │   │   └── stocks.service.ts
│   │   └── tutor/
│   │       ├── index.ts
│   │       └── tutor.service.ts
│   ├── stores/
│   │   ├── index.ts
│   │   ├── stock/
│   │   │   ├── index.ts
│   │   │   ├── stock.store.ts
│   │   │   └── stock-store.state.ts
│   │   └── environment/
│   │       ├── index.ts
│   │       └── environment.store.ts
│   ├── components/
│   │   ├── stock-list/
│   │   │   ├── stock-list.component.ts
│   │   │   ├── stock-list.component.html
│   │   │   ├── stock-list.component.scss
│   │   │   └── stock-list.component.spec.ts
│   │   └── stock-detail/
│   │       ├── stock-detail.component.ts
│   │       ├── stock-detail.component.html
│   │       ├── stock-detail.component.scss
│   │       └── stock-detail.component.spec.ts
│   └── app.routes.ts
```

---

## Service Layer

### Service Responsibilities

Services are responsible for:
- Making HTTP requests to APIs
- Handling request/response transformations
- Returning Observables to stores
- **NOT** managing state (state belongs in stores)

### Service Structure

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentStore } from '../../stores';
import { ItemResponse, ItemsResponse, MyModel } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class MyService {
  readonly env = inject(EnvironmentStore);
  readonly http = inject(HttpClient);

  getItems(): Observable<ItemsResponse<MyModel>> {
    const url = this.env.apiUrl() + '/api/items';
    return this.http.get<ItemsResponse<MyModel>>(url);
  }

  getItem(id: string): Observable<ItemResponse<MyModel>> {
    const url = this.env.apiUrl() + `/api/items/${id}`;
    return this.http.get<ItemResponse<MyModel>>(url);
  }

  createItem(data: MyModel): Observable<ItemResponse<MyModel>> {
    const url = this.env.apiUrl() + '/api/items';
    return this.http.post<ItemResponse<MyModel>>(url, data);
  }

  updateItem(id: string, data: MyModel): Observable<ItemResponse<MyModel>> {
    const url = this.env.apiUrl() + `/api/items/${id}`;
    return this.http.put<ItemResponse<MyModel>>(url, data);
  }

  deleteItem(id: string): Observable<ItemResponse<string>> {
    const url = this.env.apiUrl() + `/api/items/${id}`;
    return this.http.delete<ItemResponse<string>>(url);
  }
}
```

### Service Pattern Rules

1. Always use `inject()` function for dependency injection
2. Mark injected dependencies as `readonly`
3. All HTTP methods return `Observable<T>`
4. Use generic response types: `ItemResponse<T>` or `ItemsResponse<T>`
5. Build URLs using environment store for base URL
6. No state management in services
7. No direct store updates from services

---

## Store Layer

### Store Responsibilities

Stores are responsible for:
- Managing application state using NgrX Signal Store
- Calling service methods to fetch data
- Updating state based on service responses
- Providing signals for components to read
- Handling loading states and error handling

### Store Structure

Every store must include:
1. **State file** (`*.state.ts`) - Defines state type and initial state
2. **Store file** (`*.store.ts`) - Implements the signal store with methods

### State File Pattern

```typescript
// stock-store.state.ts
import { Stock, initialStock, StockPurchaseRequest, initialStockPurchaseRequest } from '../../models';

export type StockStoreState = {
  isEntitiesLoaded: boolean;
  isLoading: boolean;
  currentStock: Stock;
  currentStockPurchaseRequest: StockPurchaseRequest;
};

export const initialStockStoreState = (): StockStoreState => ({
  isEntitiesLoaded: false,
  isLoading: false,
  currentStock: initialStock(),
  currentStockPurchaseRequest: initialStockPurchaseRequest(),
});
```

### Store File Pattern

```typescript
// stock.store.ts
import {
  patchState,
  signalStore,
  type,
  withMethods,
  withState,
} from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialStockStoreState } from './stock-store.state';
import { Stock } from '../../models';
import { StockService } from '../../services';

const collection = 'stock';

export const StockStore = signalStore(
  { providedIn: 'root' },
  withState(initialStockStoreState()),
  withEntities({ entity: type<Stock>(), collection: collection }),
  withMethods((store, stockService = inject(StockService)) => ({
    resolveStocks: async () => {
      // Prevent duplicate loading
      if (store.isEntitiesLoaded()) {
        return true;
      }

      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          stockService.getStocks()
        );

        if (success) {
          patchState(
            store,
            setAllEntities(items, {
              collection: collection,
              selectId: (stock: Stock) => stock.tickerSymbol,
            }),
            {
              isLoading: false,
              isEntitiesLoaded: true,
            }
          );
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading stocks:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    resolveStock: async (tickerSymbol: string) => {
      const stock = store
        .stockEntities()
        .find((stock) => stock.tickerSymbol === tickerSymbol);
      
      patchState(store, {
        currentStock: stock || initialStock(),
      });
    },

    updateCurrentStockPurchaseRequest: (request: StockPurchaseRequest) => {
      patchState(store, {
        currentStockPurchaseRequest: request,
      });
    },

    resetCurrentStock: () => {
      patchState(store, {
        currentStock: initialStock(),
        currentStockPurchaseRequest: initialStockPurchaseRequest(),
      });
    },
  }))
);
```

### Store Pattern Rules

1. **State Management**:
   - Always include `isLoading` and `isEntitiesLoaded` flags
   - Use `patchState()` for all state updates
   - Initialize state with factory functions

2. **Entity Collections**:
   - Use `withEntities()` for managing collections
   - Define collection name as a constant
   - Provide `selectId` function for entity identification

3. **Methods**:
   - Prefix data-loading methods with `resolve` (e.g., `resolveStocks`, `resolveStock`)
   - Make all async methods return `Promise<boolean>` or `Promise<void>`
   - Use `firstValueFrom()` to convert Observables to Promises
   - Always wrap service calls in try-catch blocks
   - Update loading states before and after service calls

4. **Error Handling**:
   - Log errors to console
   - Reset loading states on error
   - Provide fallback values (use initial factory functions)

---

## Component Layer

### Component Responsibilities

Components are responsible for:
- Managing UI logic and local component state
- Managed in it's own code directory such as home/ header/ login/
- Reading data from stores via signals
- Handling user interactions
- Rendering templates with PrimeNG components
- **NOT** calling services directly
- **NOT** managing application state

### Component Structure

```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { StockStore } from '../../stores';
import { Stock } from '../../models';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss',
})
export class StockListComponent implements OnInit {
  readonly stockStore = inject(StockStore);
  readonly router = inject(Router);

  // Component-level state (UI state only)
  selectedStock = signal<Stock | null>(null);
  showDialog = signal(false);

  ngOnInit(): void {
    // Store methods are called here or via route resolver
    this.stockStore.resolveStocks();
  }

  onStockSelect(stock: Stock): void {
    this.selectedStock.set(stock);
  }

  onViewDetails(stock: Stock): void {
    this.router.navigate(['/stocks', stock.tickerSymbol]);
  }

  onToggleDialog(): void {
    this.showDialog.update(value => !value);
  }

  // Computed values from store
  get stocks() {
    return this.stockStore.stockEntities();
  }

  get isLoading() {
    return this.stockStore.isLoading();
  }
}
```

### Component Template Pattern

```html
<!-- stock-list.component.html -->
<p-card header="Stock List">
  <div class="card">
    <p-table 
      [value]="stocks" 
      [loading]="isLoading"
      [paginator]="true" 
      [rows]="10"
      [tableStyle]="{ 'min-width': '50rem' }">
      
      <ng-template pTemplate="header">
        <tr>
          <th>Ticker</th>
          <th>Company Name</th>
          <th>Current Price</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      
      <ng-template pTemplate="body" let-stock>
        <tr>
          <td>{{ stock.tickerSymbol }}</td>
          <td>{{ stock.companyName }}</td>
          <td>{{ stock.currentPrice | currency }}</td>
          <td>
            <p-button 
              label="View Details" 
              icon="pi pi-eye"
              (onClick)="onViewDetails(stock)">
            </p-button>
          </td>
        </tr>
      </ng-template>
    </p-table>
  </div>
</p-card>
```

### Component Pattern Rules

1. **Dependency Injection**:
   - Always use `inject()` function
   - Mark injected dependencies as `readonly`
   - Only inject stores and Router, never services

2. **State Management**:
   - Use `signal()` for component-level UI state only
   - Read application state from stores using signals
   - Never modify store state directly

3. **Lifecycle Hooks**:
   - Call store `resolve*` methods in `ngOnInit()` or use route resolvers
   - No HTTP calls in components

4. **Methods**:
   - Prefix event handlers with `on` (e.g., `onClick`, `onSubmit`)
   - Keep methods focused on UI logic only
   - Delegate business logic to stores

5. **Getters**:
   - Use getters to expose store signals to templates
   - Keep getter logic minimal

---

## Routing and State Management

### Route Configuration

Routes trigger store methods to load data via resolvers or component initialization.

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';

import { StockStore } from './stores';

export const routes: Routes = [
  {
    path: 'stocks',
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./components/stock-list/stock-list.component')
            .then(m => m.StockListComponent),
        resolve: {
          stocks: () => inject(StockStore).resolveStocks(),
        },
      },
      {
        path: ':ticker',
        loadComponent: () => 
          import('./components/stock-detail/stock-detail.component')
            .then(m => m.StockDetailComponent),
        resolve: {
          stock: (route) => {
            const ticker = route.paramMap.get('ticker');
            return inject(StockStore).resolveStock(ticker!);
          },
        },
      },
    ],
  },
  {
    path: '',
    redirectTo: 'stocks',
    pathMatch: 'full',
  },
];
```

### Resolver Pattern Rules

1. Use inline resolvers with `inject()` function
2. Call store `resolve*` methods from resolvers
3. Extract route parameters using `route.paramMap.get()`
4. Store methods handle the actual data loading
5. Components can access loaded data immediately on init

### Alternative: Component-Based Loading

If not using resolvers, load data in `ngOnInit()`:

```typescript
ngOnInit(): void {
  // For list views
  this.stockStore.resolveStocks();
  
  // For detail views with route params
  this.route.params.subscribe(params => {
    const ticker = params['ticker'];
    this.stockStore.resolveStock(ticker);
  });
}
```

---

## PrimeNG Integration

### Required PrimeNG Setup

1. **Install PrimeNG and dependencies**:
```bash
yarn add primeng primeicons
```

2. **Add PrimeNG styles to `angular.json`**:
```json
{
  "styles": [
    "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
    "node_modules/primeng/resources/primeng.css",
    "node_modules/primeicons/primeicons.css",
    "src/styles.scss"
  ]
}
```

### Common PrimeNG Components

#### Table Component
```typescript
import { TableModule } from 'primeng/table';

// In template
<p-table [value]="items" [loading]="isLoading">
  <ng-template pTemplate="header">
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-item>
    <tr>
      <td>{{ item.field1 }}</td>
      <td>{{ item.field2 }}</td>
    </tr>
  </ng-template>
</p-table>
```

#### Button Component
```typescript
import { ButtonModule } from 'primeng/button';

// In template
<p-button 
  label="Click Me" 
  icon="pi pi-check" 
  (onClick)="onButtonClick()">
</p-button>
```

#### Card Component
```typescript
import { CardModule } from 'primeng/card';

// In template
<p-card header="Title" subheader="Subtitle">
  <p>Content goes here</p>
</p-card>
```

#### Dialog Component
```typescript
import { DialogModule } from 'primeng/dialog';

// In template
<p-dialog 
  header="Dialog Title" 
  [(visible)]="showDialog" 
  [modal]="true">
  <p>Dialog content</p>
</p-dialog>
```

#### Form Components
```typescript
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

// In template
<input type="text" pInputText [(ngModel)]="value" />

<p-dropdown 
  [options]="options" 
  [(ngModel)]="selectedValue" 
  optionLabel="name">
</p-dropdown>

<p-calendar 
  [(ngModel)]="date" 
  dateFormat="mm/dd/yy">
</p-calendar>
```

### PrimeNG Pattern Rules

1. **Import Modules**: Always import PrimeNG modules in component imports array
2. **Standalone Components**: All components must be standalone with explicit imports
3. **Templates**: Use PrimeNG's `ng-template` with `pTemplate` directive
4. **Icons**: Use PrimeIcons classes (e.g., `pi pi-check`, `pi pi-times`)
5. **Styling**: Use PrimeNG's built-in style classes when available
6. **Responsiveness**: Utilize PrimeNG's responsive utilities

---

## File Organization

### Index File Pattern

Every folder containing TypeScript files must have an `index.ts` file for barrel exports.

```typescript
// models/index.ts
export * from './stock.model';
export * from './user.model';
export * from './api-response.model';
export * from './tutor-question.model';
```

```typescript
// services/index.ts
export * from './stocks';
export * from './tutor';
export * from './auth';
```

```typescript
// stores/index.ts
export * from './stock';
export * from './environment';
export * from './user';
```

### Folder Structure Rules

1. **Group by Feature**: Related files go in feature folders
2. **Index Files**: Every folder with exports needs `index.ts`
3. **Naming Convention**:
   - Services: `*.service.ts`
   - Stores: `*.store.ts`
   - Store States: `*-store.state.ts`
   - Models: `*.model.ts`
   - Components: `*.component.ts`, `*.component.html`, `*.component.scss`

---

## Code Examples

### Complete Feature Example

#### 1. Model Definition

```typescript
// models/tutor-question.model.ts
export type TutorQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  ticker?: string;
  createdAt: string;
};

export const initialTutorQuestion = (): TutorQuestion => ({
  id: '',
  question: '',
  options: [],
  correctAnswer: '',
  explanation: '',
  ticker: undefined,
  createdAt: new Date().toISOString(),
});

export type CorrectAnswer = {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
};

export const initialCorrectAnswer = (): CorrectAnswer => ({
  isCorrect: false,
  correctAnswer: '',
  explanation: '',
});
```

#### 2. Service Implementation

```typescript
// services/tutor/tutor.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EnvironmentStore } from '../../stores';
import {
  Apis,
  CorrectAnswer,
  ItemResponse,
  ItemsResponse,
  Page,
  TutorQuestion,
} from '../../models';

@Injectable({
  providedIn: 'root',
})
export class TutorService {
  readonly env = inject(EnvironmentStore);
  readonly http = inject(HttpClient);

  getQuestion(): Observable<ItemResponse<TutorQuestion>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.Question;
    return this.http.get<ItemResponse<TutorQuestion>>(url);
  }

  getStockQuestion(ticker: string): Observable<ItemResponse<TutorQuestion>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.Question + '/' + ticker;
    return this.http.get<ItemResponse<TutorQuestion>>(url);
  }

  getRandomQuestion(): Observable<ItemResponse<TutorQuestion>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.RandomQuestion;
    return this.http.get<ItemResponse<TutorQuestion>>(url);
  }

  getAnswer(selectedQuestion: string): Observable<ItemResponse<CorrectAnswer>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.Answer;
    const requestBody = { selectedQuestion: selectedQuestion };
    return this.http.post<ItemResponse<CorrectAnswer>>(url, requestBody);
  }

  getHistory(): Observable<ItemsResponse<TutorQuestion>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.History;
    return this.http.get<ItemsResponse<TutorQuestion>>(url);
  }

  resetHistory(): Observable<ItemResponse<string>> {
    const url = this.env.apiUrl() + Apis.Tutor + Page.ResetHistory;
    return this.http.delete<ItemResponse<string>>(url);
  }
}
```

#### 3. Store State Definition

```typescript
// stores/tutor/tutor-store.state.ts
import {
  TutorQuestion,
  initialTutorQuestion,
  CorrectAnswer,
  initialCorrectAnswer,
} from '../../models';

export type TutorStoreState = {
  isLoading: boolean;
  isHistoryLoaded: boolean;
  currentQuestion: TutorQuestion;
  questionHistory: TutorQuestion[];
  lastAnswer: CorrectAnswer;
  showAnswer: boolean;
};

export const initialTutorStoreState = (): TutorStoreState => ({
  isLoading: false,
  isHistoryLoaded: false,
  currentQuestion: initialTutorQuestion(),
  questionHistory: [],
  lastAnswer: initialCorrectAnswer(),
  showAnswer: false,
});
```

#### 4. Store Implementation

```typescript
// stores/tutor/tutor.store.ts
import {
  patchState,
  signalStore,
  withMethods,
  withState,
} from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { initialTutorStoreState } from './tutor-store.state';
import { TutorQuestion } from '../../models';
import { TutorService } from '../../services';

export const TutorStore = signalStore(
  { providedIn: 'root' },
  withState(initialTutorStoreState()),
  withMethods((store, tutorService = inject(TutorService)) => ({
    resolveQuestion: async () => {
      patchState(store, { isLoading: true, showAnswer: false });

      try {
        const { item, success } = await firstValueFrom(
          tutorService.getQuestion()
        );

        if (success) {
          patchState(store, {
            currentQuestion: item,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading question:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    resolveStockQuestion: async (ticker: string) => {
      patchState(store, { isLoading: true, showAnswer: false });

      try {
        const { item, success } = await firstValueFrom(
          tutorService.getStockQuestion(ticker)
        );

        if (success) {
          patchState(store, {
            currentQuestion: item,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading stock question:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    resolveRandomQuestion: async () => {
      patchState(store, { isLoading: true, showAnswer: false });

      try {
        const { item, success } = await firstValueFrom(
          tutorService.getRandomQuestion()
        );

        if (success) {
          patchState(store, {
            currentQuestion: item,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading random question:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    submitAnswer: async (selectedAnswer: string) => {
      patchState(store, { isLoading: true });

      try {
        const { item, success } = await firstValueFrom(
          tutorService.getAnswer(selectedAnswer)
        );

        if (success) {
          patchState(store, {
            lastAnswer: item,
            showAnswer: true,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        patchState(store, { isLoading: false });
      }
    },

    resolveHistory: async () => {
      if (store.isHistoryLoaded()) {
        return true;
      }

      patchState(store, { isLoading: true });

      try {
        const { items, success } = await firstValueFrom(
          tutorService.getHistory()
        );

        if (success) {
          patchState(store, {
            questionHistory: items,
            isHistoryLoaded: true,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error loading history:', error);
        patchState(store, { isLoading: false });
      }

      return true;
    },

    clearHistory: async () => {
      patchState(store, { isLoading: true });

      try {
        const { success } = await firstValueFrom(
          tutorService.resetHistory()
        );

        if (success) {
          patchState(store, {
            questionHistory: [],
            isHistoryLoaded: false,
            isLoading: false,
          });
        } else {
          patchState(store, { isLoading: false });
        }
      } catch (error) {
        console.error('Error clearing history:', error);
        patchState(store, { isLoading: false });
      }
    },

    hideAnswer: () => {
      patchState(store, { showAnswer: false });
    },
  }))
);
```

#### 5. Component Implementation

```typescript
// components/tutor-question/tutor-question.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { TutorStore } from '../../stores';

@Component({
  selector: 'app-tutor-question',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    RadioButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './tutor-question.component.html',
  styleUrl: './tutor-question.component.scss',
})
export class TutorQuestionComponent implements OnInit {
  readonly tutorStore = inject(TutorStore);
  readonly router = inject(Router);

  selectedAnswer = signal<string>('');

  ngOnInit(): void {
    this.tutorStore.resolveQuestion();
  }

  onAnswerSelect(answer: string): void {
    this.selectedAnswer.set(answer);
  }

  onSubmitAnswer(): void {
    if (this.selectedAnswer()) {
      this.tutorStore.submitAnswer(this.selectedAnswer());
    }
  }

  onNextQuestion(): void {
    this.selectedAnswer.set('');
    this.tutorStore.hideAnswer();
    this.tutorStore.resolveRandomQuestion();
  }

  onViewHistory(): void {
    this.router.navigate(['/tutor/history']);
  }

  get currentQuestion() {
    return this.tutorStore.currentQuestion();
  }

  get isLoading() {
    return this.tutorStore.isLoading();
  }

  get showAnswer() {
    return this.tutorStore.showAnswer();
  }

  get lastAnswer() {
    return this.tutorStore.lastAnswer();
  }
}
```

#### 6. Component Template

```html
<!-- tutor-question.component.html -->
<div class="tutor-container">
  <p-card header="Stock Market Tutor">
    <div *ngIf="isLoading" class="loading-container">
      <p-progressSpinner></p-progressSpinner>
    </div>

    <div *ngIf="!isLoading && currentQuestion" class="question-container">
      <h3>{{ currentQuestion.question }}</h3>

      <div class="options-container">
        <div *ngFor="let option of currentQuestion.options" class="option-item">
          <p-radioButton
            [value]="option"
            [(ngModel)]="selectedAnswer"
            [inputId]="option"
            (onClick)="onAnswerSelect(option)">
          </p-radioButton>
          <label [for]="option" class="ml-2">{{ option }}</label>
        </div>
      </div>

      <div class="button-container">
        <p-button
          *ngIf="!showAnswer"
          label="Submit Answer"
          icon="pi pi-check"
          [disabled]="!selectedAnswer()"
          (onClick)="onSubmitAnswer()">
        </p-button>

        <p-button
          *ngIf="showAnswer"
          label="Next Question"
          icon="pi pi-arrow-right"
          (onClick)="onNextQuestion()">
        </p-button>

        <p-button
          label="View History"
          icon="pi pi-history"
          severity="secondary"
          (onClick)="onViewHistory()">
        </p-button>
      </div>

      <div *ngIf="showAnswer" class="answer-container">
        <p-card [header]="lastAnswer.isCorrect ? 'Correct!' : 'Incorrect'">
          <p><strong>Correct Answer:</strong> {{ lastAnswer.correctAnswer }}</p>
          <p><strong>Explanation:</strong> {{ lastAnswer.explanation }}</p>
        </p-card>
      </div>
    </div>
  </p-card>
</div>
```

---

## Best Practices Summary

### Architecture Rules
✅ **DO**:
- Use yarn for all package management
- Use types instead of interfaces
- Create index.ts files for all folders with exports
- Call services only from stores
- Read data only from stores in components
- Use signals for reactivity
- Use PrimeNG for all UI components
- Implement proper error handling in stores
- Use route resolvers or ngOnInit for data loading

❌ **DON'T**:
- Use npm or other package managers
- Use interfaces
- Call services directly from components
- Manage application state in components
- Use subjects or BehaviorSubjects (use signals instead)
- Mix different UI frameworks with PrimeNG
- Ignore loading and error states
- Make HTTP calls from components

### Code Quality
- Always include try-catch blocks in store methods
- Always update loading states appropriately
- Always provide initial values for all state properties
- Always use readonly for injected dependencies
- Always use inject() function for DI
- Always create standalone components
- Always provide proper TypeScript types

### File Organization
- Group related files in feature folders
- Use consistent naming conventions
- Keep one responsibility per file
- Export through index.ts files
- Maintain clear separation of concerns

---

## Checklist for AI Agents

When constructing an Angular UI, verify:

- [ ] Yarn is used for package management
- [ ] All models are defined as types, not interfaces
- [ ] Each model has an initial value factory function
- [ ] Services only make HTTP calls and return Observables
- [ ] Services use inject() for dependencies
- [ ] Stores have separate state files with initial state functions
- [ ] Stores use signalStore from @ngrx/signals
- [ ] Store methods call services and update state
- [ ] Store methods include proper error handling
- [ ] Components only inject stores, not services
- [ ] Components use signals for local UI state
- [ ] Components read application state from stores
- [ ] Routes use resolvers or ngOnInit to trigger store methods
- [ ] All components are standalone with explicit imports
- [ ] PrimeNG modules are imported in components
- [ ] All folders with TypeScript files have index.ts
- [ ] Index files use barrel export pattern
- [ ] Loading and error states are managed consistently

---

## Conclusion

This guide provides a comprehensive blueprint for constructing Angular applications using NgrX Signal Store, services, and PrimeNG. By following these patterns and rules, AI agents can generate consistent, maintainable, and scalable Angular code that adheres to best practices and architectural principles.

Remember: **Services fetch data → Stores manage state → Components display UI**