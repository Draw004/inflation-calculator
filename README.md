# Carrowmont Inflation Calculator v1.0.2

A browser-based global inflation calculator designed for `carrowmont.com/inflation-calculator/`.

## Global localization architecture

The shared `locale.js` module stores:
- selected country / region
- selected currency
- locale-aware number formatting

Storage keys are intentionally generic so the same module can later be reused by other Carrowmont tools:
- `carrowmont_region_v1`
- `carrowmont_currency_v1`

Supported regions include:
- India / INR
- United States / USD
- Canada / CAD
- United Kingdom / GBP
- Australia / AUD
- New Zealand / NZD
- China / CNY
- Japan / JPY
- South Korea / KRW
- Singapore / SGD
- United Arab Emirates / AED
- Saudi Arabia / SAR
- Germany, France, Italy and Spain / EUR
- Switzerland / CHF
- Brazil / BRL
- Mexico / MXN
- South Africa / ZAR
- Indonesia / IDR
- Malaysia / MYR
- Thailand / THB
- Philippines / PHP
- Vietnam / VND
- Hong Kong / HKD
- Taiwan / TWD
- Russia / RUB
- Türkiye / TRY
- Other / International

Users can override the suggested currency independently. The currency list includes INR, USD, CAD, GBP, AUD, NZD, EUR, CNY, JPY, KRW, SGD, AED, SAR, CHF, BRL, MXN, ZAR, IDR, MYR, THB, PHP, VND, HKD, TWD, RUB and TRY.

Changing currency changes the unit and formatting; it does **not** perform FX conversion.

## Calculation

Future cost = amount today × (1 + inflation rate)^years

Today's-equivalent purchasing power = nominal amount ÷ (1 + inflation rate)^years

Scenario chart uses:
- lower = entered rate - 2 percentage points (floor 0%)
- base = entered rate
- higher = entered rate + 2 percentage points

## Deployment

Create a GitHub repository named `inflation-calculator`, upload all files in this folder to the repository root, and enable GitHub Pages from the main branch/root directory.

Expected public path (assuming the same GitHub Pages/custom-domain setup as the retirement tool):

`https://carrowmont.com/inflation-calculator/`

After the tool is live, update the main Carrowmont homepage Inflation Calculator card from “Coming soon” to “Open calculator”.


## v1.0.1 changes
- Inflation-rate field now allows normal manual decimal entry such as 4.5 or 5.5 without rewriting the field mid-typing.
- Expanded country/region and currency support for major economies.


## v1.0.2 changes
- Added a clear **Done** button to the country/currency panel.
- The panel also closes when clicking outside it or pressing Escape.
- Country selection still updates the suggested currency immediately, while leaving the panel open so users can optionally override the currency before closing.
- Manual decimal inflation input from v1.0.1 is retained.
