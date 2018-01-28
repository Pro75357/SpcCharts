

export function updateSelectors() {
    let dateField = Session.get('xAxis');
    let valueField = Session.get('yAxis');

//    console.log('dateField: ' + dateField);
  //  console.log('valueField: ' + valueField);

    document.getElementById('xAxis').value = dateField;
    document.getElementById('yAxis').value = valueField;
}