// Importejam axios biblioteku
import axios from 'axios';

// Uztaisam klasi prieks 
class CountryTable {
    //klases ipasibas 
    public currentPage: number;
    public pageSize: number;
    public totalCount: number;

    // ar constructor palidzibu iedodam vertibas
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.totalCount = 12; 

        // Palaizam funkciju
        this.searchSetup();
    }

    // Atjauno tabulu atbilstoši pašreizējiem filtriem
    public async loadData(filters: Record<string, string>): Promise<any[]> {
        const filterParams = Object.entries(filters)
            .map(([key, value]) => value !== '' ? `${key}=${value}` : null)
            .filter(param => param !== null)
            .join('&');
    
        console.log('Objekts:', filters);
        const url = `http://localhost:3004/countries?_page=${this.currentPage}&_limit=${this.pageSize}${filterParams ? `&${filterParams}` : ''}`;

    
        console.log('Iegustam datus no JSON!', url);
    
        
            const response = await axios.get(url, { headers: { 'Cache-Control': 'no-cache' } });
    
            console.log('Full API Response:', response);
    
            if (!response.data || !Array.isArray(response.data)) {
                console.error('Nepareizi ievadits info:', response.data);
                return [];
            }
    
            const totalCountHeader = response.headers['x-total-count'];
            if (totalCountHeader !== undefined) {
                this.totalCount = parseInt(totalCountHeader, 10);
            }
    
            return response.data;
        
        
    }
    
    public populateTable(countries: any[]) {
        // Iegustam table elementu
        const tableBody = document.querySelector<HTMLTableElement>('.jsTableBody');

        // Resetojam table elementus lai spiezot next tie neietu viena rinda
        tableBody.innerHTML = '';

        // parbaudam vai valstis nesakrit
        if (countries.length === 0) {
            console.log('Nav Atrasta Neviena Valsts!');
            return;
        }

        //Izejam cauri visam valstim un uztaisam table rows
        countries.forEach((country, index) => {
            const row = document.createElement('tr');
            // Calculate the row number based on current page, page size, and index
            const rowNumber = (this.currentPage - 1) * this.pageSize + index + 1;
            // Uztaisam tabulu Html
            row.innerHTML = `
                <th scope="row">${rowNumber}</th>
                <td>${country.currency.symbol}</td>
                <td>${country.name}</td>
                <td>${country.capital}</td>
                <td>${country.currency.name }</td>
                <td>${country.language.name }</td>
            `;
            // updatojam tabulu
            tableBody.appendChild(row);
        });
    }

    // Updeitojam tabulu
    public async updateTable() {
        // Get filter values from input elements
        const nameFilter = (document.querySelector('.jsName') as HTMLInputElement)?.value || '';  //ja nav atrast ir null vai undefiend
        const capitalFilter = (document.querySelector('.jsCapital') as HTMLInputElement)?.value || '';
        const currencyNameFilter = (document.querySelector('.jsCurrencyName') as HTMLInputElement)?.value || '';
        const currencySymbolFilter = (document.querySelector('.jsCurrencySymbol') as HTMLInputElement)?.value || '';
        const languageNameFilter = (document.querySelector('.jsLanguageName') as HTMLInputElement)?.value || '';

        // Updeitojam filtrus
        console.log('Filtru atjaunosana:', { nameFilter, capitalFilter, currencyNameFilter, currencySymbolFilter, languageNameFilter });

        // Aizsutam datus
        const countries = await this.loadData({
            name: nameFilter,
            capital: capitalFilter,
            'currency.name': currencyNameFilter,
            'currency.symbol': currencySymbolFilter,
            'language.name': languageNameFilter,
        });

        // Izlogojam aizsutitos datus
        console.log('Atjaunojam tabulu', countries);
        this.populateTable(countries);
        this.updatePageInfo();
    }

    // Saliekam eventlistenerus
    public setupPages() {
        const prevBtn = document.querySelector('.jsPaginationPrev') as HTMLButtonElement | null;
        const nextBtn = document.querySelector('.jsPaginationNext') as HTMLButtonElement | null;

        if (prevBtn && nextBtn) {

            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.updateTable();
                }
            });

            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalCount / this.pageSize);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.updateTable();
                }
            });

            // Updatojam lapas info
            this.updatePageInfo();
        }
    }

    //Updeitojam lpp info
    public updatePageInfo() {
        // Iegustam elementus ar klasem
        const currentPageSpan = document.querySelector('.jsCurrentPage') as HTMLSpanElement;
        const totalPagesSpan = document.querySelector('.jsTotalPages') as HTMLSpanElement;
    
        if (currentPageSpan && totalPagesSpan) {
            // aprekina cik ir lpp
            const totalPages = Math.ceil(this.totalCount / this.pageSize);
            currentPageSpan.textContent = this.currentPage.toString();
            totalPagesSpan.textContent = totalPages.toString();
        }
    }

    // Serchu updatojam
    public async search() {
        // sakoties sercham updeitojam lpp uz 1
        this.currentPage = 1;
        this.updateTable();
    }

    // queary selectora ievadisim jsSerchBtn un pievienosim evenet listeneru un paladism programu
    public searchSetup() {
        const searchBtn = document.querySelector('.jsSearchBtn') as HTMLButtonElement | null;

        if (searchBtn) {
            searchBtn.addEventListener('click', this.search.bind(this));
        }

        this.setupPages();

        this.loadData({
            name: '',
            capital: '',
            'currency.name': '',
            'currency.symbol': '',
            'language.name': '',
        }).then(countries => {
            this.populateTable(countries);
            this.updatePageInfo();
            this.totalCount = countries.length;
            this.currentPage = 1;

            this.updateTable();
        });
    }
}

// Palaizam klasi
document.addEventListener('DOMContentLoaded', () => {
    new CountryTable();
});
