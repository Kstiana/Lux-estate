const LuxCalculator = (function () {
  let priceInput = null;
  let downPaymentInput = null;
  let rateInput = null;
  let termInput = null;
  let monthlyOutput = null;
  let totalInterestOutput = null;
  let totalPaymentOutput = null;

  function formatCurrency(amount) {
    return '\u20A6' + Math.round(amount).toLocaleString('en-NG');
  }

  function recalculate() {
    if (!priceInput || !downPaymentInput || !rateInput || !termInput || !monthlyOutput) {
      return;
    }

    const price = parseFloat(priceInput.value) || 0;
    const downPaymentPercent = parseFloat(downPaymentInput.value) || 0;
    const annualRate = parseFloat(rateInput.value) || 0;
    const termYears = parseFloat(termInput.value) || 0;

    const downPayment = price * (downPaymentPercent / 100);
    const principal = Math.max(price - downPayment, 0);
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;

    let monthlyPayment = 0;

    if (principal > 0 && numPayments > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = principal / numPayments;
      } else {
        const factor = Math.pow(1 + monthlyRate, numPayments);
        monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
      }
    }

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;

    monthlyOutput.textContent = formatCurrency(monthlyPayment);

    if (totalInterestOutput) {
      totalInterestOutput.textContent = formatCurrency(totalInterest > 0 ? totalInterest : 0);
    }

    if (totalPaymentOutput) {
      totalPaymentOutput.textContent = formatCurrency(totalPayment > 0 ? totalPayment : 0);
    }
  }

  function init() {
    const form = document.getElementById('mortgage-calculator-form');
    if (!form) {
      return;
    }

    priceInput = document.getElementById('calc-price');
    downPaymentInput = document.getElementById('calc-down-payment');
    rateInput = document.getElementById('calc-rate');
    termInput = document.getElementById('calc-term');
    monthlyOutput = document.getElementById('calc-monthly-payment');
    totalInterestOutput = document.getElementById('calc-total-interest');
    totalPaymentOutput = document.getElementById('calc-total-payment');

    [priceInput, downPaymentInput, rateInput, termInput].forEach(function (input) {
      if (input) {
        input.addEventListener('input', recalculate);
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      recalculate();
    });

    recalculate();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    recalculate: recalculate
  };
})();
