const API_URL = 'https:/in3.dev/inv/';

function getSerial(string) {
    let serial = '';
    for (let i=0; i<string.length; i++) {
        if (string[i] !== '-') {
            serial += string[i];
        } else {
            break;
        }
    }
    return serial;
}

function getNumber(string) {
    let number = '';

    for(let i=0; i<string.length; i++) {
        if(string[i] >= 0 || string[i] <= 9) {
            number += string[i];
        } else {
            number;
        }
    }
    return number;
}

function percentToAmount(sum, percent) {
    return (sum*percent/100).toFixed(2);
}

function discountToAmount(price, discountType, discountValue) {
    if (discountType == 'fixed') {
        return -discountValue;
    };
    if (discountType === 'percentage') {
        return -percentToAmount(price, discountValue);
    }
    return 0;
}

function percentageRender(discountType, discountValue) {
    return discountType === 'percentage' ? `(-${discountValue}%)` : '';
}

function itemsSum(price, quantity, discountType, discountValue) {
    const discount = discountToAmount(price, discountType, discountValue);
    const priceWithDiscount = price + discount;
    return (priceWithDiscount * quantity).toFixed(2);
}

function totalWithoutVat(sums) {
    return sums.reduce((sum, s) => sum + Number(s), 0);
}

fetch(API_URL)
    .then(response => response.json())
    .then(data => {

        document.querySelector('[data-vatSerial]').textContent = getSerial(data.number);
        document.querySelector('[data-vatNumber]').textContent = getNumber(data.number);
        
        document.querySelector('[data-seller]').textContent = data.company.seller.name;
        document.querySelector('[data-seller-address]').textContent = data.company.seller.address;
        document.querySelector('[data-seller-code]').textContent = data.company.seller.code;
        document.querySelector('[data-seller-vat]').textContent = data.company.seller.vat;
        document.querySelector('[data-seller-phone]').textContent = data.company.seller.phone;
        document.querySelector('[data-seller-email]').textContent = data.company.seller.email;

        document.querySelector('[data-buyer]').textContent = data.company.buyer.name;
        document.querySelector('[data-buyer-address]').textContent = data.company.buyer.address;
        document.querySelector('[data-buyer-code]').textContent = data.company.buyer.code;
        document.querySelector('[data-buyer-vat]').textContent = data.company.buyer.vat;
        document.querySelector('[data-buyer-phone]').textContent = data.company.buyer.phone;
        document.querySelector('[data-buyer-email]').textContent = data.company.buyer.email;

        document.querySelector('[data-due-date]').textContent = data.due_date;

        const tbody = document.querySelector('tbody');

        const items = data.items;
        console.log(items);

        items.forEach((el, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = 
            `
                <td>${i + 1}</td>
                <td>${el.description}</td>
                <td>${el.quantity}</td>
                <td>${el.price}</td>
                <td>${discountToAmount(el.price, el.discount.type, el.discount.value)}</td>
                <td data-sum>${itemsSum(el.price, el.quantity, el.discount.type, el.discount.value)}</td>

            `
            tbody.appendChild(tr);
            
        });

        const trShipping = document.createElement('tr');
        trShipping.innerHTML = 
            `
                <td colspan="5">Transporto išlaidos: </td>
                <td>${(data.shippingPrice).toFixed(2)}</td>
            `
            tbody.appendChild(trShipping);

        const trAllSum = document.createElement('tr');
        const sumsArr = tbody.querySelectorAll('[data-sum]');
        console.log(sumsArr);

        const textContentArray = [];

        sumsArr.forEach(sum => {
            textContentArray.push(sum.textContent)
        });

        trAllSum.innerHTML =
        `
            <td colspan="5">Viso su transporto išlaidomis: </td>
            <td>${totalWithoutVat(textContentArray).toFixed(2)}</td>
        `
        tbody.appendChild(trAllSum);

        const vat = document.createElement('tr');
        vat.innerHTML =
            `
            <td colspan="5">PVM (21%): </td>
            <td>${Number(percentToAmount(totalWithoutVat(textContentArray), 21)).toFixed(2)}</td>
            `
            tbody.appendChild(vat);
        
        const totalInvoice = document.createElement('tr');
        totalInvoice.innerHTML = 
            `
            <td colspan="5">Mokėtina suma: </td>
            <td>${(totalWithoutVat(textContentArray) + Number(percentToAmount(totalWithoutVat(textContentArray), 21))).toFixed(2)}</td>
            `
            tbody.appendChild(totalInvoice);

        // const invoiceNumber = data.number;
        // console.log(invoiceNumber);
    })