export default class CityPicker {
  private first: any = []; /* 省，直辖市 */
  private second: any = []; /* 市 */
  private third: any = []; /* 镇 */
  private selectedIndex: any = [0, 0, 0]; /* 默认选中的地区 */
  private checked: any = [0, 0, 0]; /* 已选选项 */
  private picker: any; /* 已选选项 */

  constructor() {
    let selectedIndex = this.selectedIndex;
    let first = this.first;
    let second = this.second;
    let third = this.third;
    let checked = this.checked;

    function creatList(obj, list){
      obj.forEach(function(item, index, arr){
        var temp = {text:item.name,value:index,id:item.id};
        list.push(temp);
      })
    }
    creatList(city, first);

    if (city[selectedIndex[0]].hasOwnProperty('child')) {
      creatList(city[selectedIndex[0]].child, second);
    } else {
      second = [{text: '', value: 0}];
    }
    
    if (city[selectedIndex[0]].child[selectedIndex[1]].hasOwnProperty('child')) {
      creatList(city[selectedIndex[0]].child[selectedIndex[1]].child, third);
    } else {
      third = [{text: '', value: 0}];
    }
    
    let picker = new Picker({
      data: [first, second, third],
      selectedIndex: selectedIndex,
      title: '地址选择'
    });

    this.picker = picker;

    picker.on('picker.change', function (index, selectedIndex) {
      if (index === 0){
        firstChange();
      } else if (index === 1) {
        secondChange();
      }
    
      function firstChange() {
        second = [];
        third = [];
        checked[0] = selectedIndex;
        var firstCity = city[selectedIndex];
        if (firstCity.hasOwnProperty('child')) {
          creatList(firstCity.child, second);
    
          var secondCity = city[selectedIndex].child[0]
          if (secondCity.hasOwnProperty('child')) {
            creatList(secondCity.child, third);
          } else {
            third = [{text: '', value: 0}];
            checked[2] = 0;
          }
        } else {
          second = [{text: '', value: 0}];
          third = [{text: '', value: 0}];
          checked[1] = 0;
          checked[2] = 0;
        }
    
        picker.refillColumn(1, second);
        picker.refillColumn(2, third);
        picker.scrollColumn(1, 0)
        picker.scrollColumn(2, 0)
      }
    
      function secondChange() {
        third = [];
        checked[1] = selectedIndex;
        var first_index = checked[0];
        if (city[first_index].child[selectedIndex].hasOwnProperty('child')) {
          var secondCity = city[first_index].child[selectedIndex];
          creatList(secondCity.child, third);
          picker.refillColumn(2, third);
          picker.scrollColumn(2, 0)
        } else {
          third = [{text: '', value: 0}];
          checked[2] = 0;
          picker.refillColumn(2, third);
          picker.scrollColumn(2, 0)
        }
      }
    
    });

    picker.on('picker.select', function (selectedVal, selectedIndex) {
      let text1 = first[selectedIndex[0]].text;
      let text2 = second[selectedIndex[1]].text;
      let text3 = third[selectedIndex[2]] ? third[selectedIndex[2]].text : '';

      let val1 = first[selectedIndex[0]]['id'];
      let val2 = second[selectedIndex[1]]['id'];
      let val3 = third[selectedIndex[2]]['id'] ? third[selectedIndex[2]]['id'] : '0';

      $("#addressLocation").val(text1 + ' ' + text2 + ' ' + text3);
      $("#addressLocation").data('province',val1);
      $("#addressLocation").data('city',val2);
      $("#addressLocation").data('area',val3);

    })
    
  }

  show(){
    this.picker.show();
  }

}





