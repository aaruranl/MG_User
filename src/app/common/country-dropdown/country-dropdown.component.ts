import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DataProviderService } from '../../core/services/data-provider.service';

export interface CountryItem {
  country: string;
  code: string;
  iso: string;
  flags?: {
    svg?: string;
    png?: string;
  };
}

@Component({
  selector: 'app-country-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-dropdown.component.html',
  styleUrl: './country-dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CountryDropdownComponent),
      multi: true,
    },
  ],
})
export class CountryDropdownComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select a country...';
  @Input() multiple: boolean = false;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() error: boolean = false;
  @Input() bindValue: 'country' | 'iso' | 'code' | 'object' = 'country';

  @Output() countryChange = new EventEmitter<any>();

  public isOpen: boolean = false;
  public searchText: string = '';
  public countryList: CountryItem[] = [];
  public filteredCountries: CountryItem[] = [];

  // Internal value(s)
  public selectedValue: any = null; // string or array of strings/objects

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private dataProvider: DataProviderService,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.countryList = this.dataProvider.getPhoneCode() || [];
    this.filteredCountries = [...this.countryList];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // --- ControlValueAccessor Implementation ---
  writeValue(val: any): void {
    this.selectedValue = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // --- Dropdown Controls ---
  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.filterList();
    } else {
      this.onTouched();
    }
  }

  onSearch(text: string): void {
    this.searchText = text;
    this.filterList();
  }

  private filterList(): void {
    const q = (this.searchText || '').toLowerCase().trim();
    if (!q) {
      this.filteredCountries = [...this.countryList];
    } else {
      this.filteredCountries = this.countryList.filter((item) =>
        item.country.toLowerCase().includes(q) ||
        item.code.includes(q) ||
        item.iso.toLowerCase().includes(q)
      );
    }
  }

  selectCountry(country: CountryItem): void {
    const valueToEmit = this.extractValue(country);

    if (this.multiple) {
      if (!Array.isArray(this.selectedValue)) {
        this.selectedValue = [];
      }
      const idx = this.selectedValue.findIndex((v: any) =>
        this.isMatch(v, country)
      );
      if (idx > -1) {
        this.selectedValue.splice(idx, 1);
      } else {
        this.selectedValue.push(valueToEmit);
      }
      this.onChange([...this.selectedValue]);
      this.countryChange.emit([...this.selectedValue]);
    } else {
      this.selectedValue = valueToEmit;
      this.onChange(this.selectedValue);
      this.countryChange.emit(this.selectedValue);
      this.isOpen = false;
    }
  }

  removeSingleSelected(country: any, event: MouseEvent): void {
    event.stopPropagation();
    if (this.multiple && Array.isArray(this.selectedValue)) {
      this.selectedValue = this.selectedValue.filter(
        (v: any) => v !== country && v?.country !== country
      );
      this.onChange([...this.selectedValue]);
      this.countryChange.emit([...this.selectedValue]);
    } else {
      this.selectedValue = null;
      this.onChange(null);
      this.countryChange.emit(null);
    }
  }

  clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue = this.multiple ? [] : null;
    this.onChange(this.selectedValue);
    this.countryChange.emit(this.selectedValue);
  }

  isSelected(country: CountryItem): boolean {
    if (!this.selectedValue) return false;
    if (this.multiple && Array.isArray(this.selectedValue)) {
      return this.selectedValue.some((v) => this.isMatch(v, country));
    }
    return this.isMatch(this.selectedValue, country);
  }

  private isMatch(val: any, country: CountryItem): boolean {
    if (typeof val === 'string') {
      return val === country.country || val === country.iso || val === country.code;
    }
    if (typeof val === 'object' && val !== null) {
      return val.iso === country.iso || val.country === country.country;
    }
    return false;
  }

  private extractValue(country: CountryItem): any {
    switch (this.bindValue) {
      case 'country':
        return country.country;
      case 'iso':
        return country.iso;
      case 'code':
        return country.code;
      case 'object':
      default:
        return country;
    }
  }

  getSelectedDisplayItem(): CountryItem | null {
    if (!this.selectedValue || this.multiple) return null;
    if (typeof this.selectedValue === 'object') return this.selectedValue;
    return this.countryList.find((c) => this.isMatch(this.selectedValue, c)) || null;
  }
}
