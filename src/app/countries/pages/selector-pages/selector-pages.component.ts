import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-pages',
  templateUrl: './selector-pages.component.html',
  styleUrls: ['./selector-pages.component.css']
})
export class SelectorPagesComponent implements OnInit{

  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  public myform: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });


  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
    ) { }

  ngOnInit(): void {
    this.onRegionChange();
    this.oncountryChange();
  }

  get regions() : Region[] {
    return this.countriesService.regions;
  }

  onRegionChange() {
    this.myform.get('region')!.valueChanges
    .pipe(
      tap( () => this.myform.get('country')!.setValue('')),
      tap( () => this.borders = []),
      switchMap( region => this.countriesService.getCountriesByRegion(region))
    )
    .subscribe(countries => {
      this.countriesByRegion = countries;
    });
  }

  oncountryChange() {
    this.myform.get('country')!.valueChanges
    .pipe(
      tap( () => this.myform.get('border')!.setValue('')),
      filter( (value:string) => value.length > 0),
      switchMap( alphCode => this.countriesService.getCountryByCode(alphCode)),
      switchMap( country => this.countriesService.getCountryBorderByCodes(country.borders))
    )
    .subscribe(countries => {
      this.borders = countries;
    });
  }



}
