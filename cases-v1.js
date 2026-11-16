const caseDetails = document.querySelectorAll('.case-details');

caseDetails.forEach(details => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    caseDetails.forEach(other => {
      if (other !== details) other.open = false;
    });
  });
});
