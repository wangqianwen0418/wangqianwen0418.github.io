var tags = ['ml4vis', 'vis4ml', "biomed", "design"];

function modifyTag(c) {
  const idx = tags.indexOf(c)
  if (idx === -1) tags.push(c);
  else tags.splice(idx, 1);
}
function filterSelection(c) {
  if (typeof c == 'string') {
    modifyTag(c)
  }
  else {
    // c is an array of tags
    tags = c
  }
  var x, i;
  x = document.getElementsByClassName("filterDiv");
  for (i = 0; i < x.length; i++) {
    var isRemain = tags.some(tag => x[i].className.indexOf(tag) > -1)
    if (isRemain) {
      w3AddClass(x[i], "show")
    } else w3RemoveClass(x[i], "show");
  }

  tag_icons = document.getElementsByClassName('paper-tag')
  for (j = 0; j < tag_icons.length; j++) {
    var isActive = tags.some(tag => tag_icons[j].className.indexOf(tag) > -1)
    if (isActive) {
      w3AddClass(tag_icons[j], "active")
    } else w3RemoveClass(tag_icons[j], "active");
  }
}

// Show filtered elements
function w3AddClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    if (arr1.indexOf(arr2[i]) == -1) {
      element.className += " " + arr2[i];
    }
  }
}

// Hide elements that are not selected
function w3RemoveClass(element, name) {
  var i, arr1, arr2;
  arr1 = element.className.split(" ");
  arr2 = name.split(" ");
  for (i = 0; i < arr2.length; i++) {
    while (arr1.indexOf(arr2[i]) > -1) {
      arr1.splice(arr1.indexOf(arr2[i]), 1);
    }
  }
  element.className = arr1.join(" ");
}

// Add active class to the current control button (highlight it)
var btnContainer = document.getElementById("myBtnContainer");
var btns = btnContainer.getElementsByClassName("btn");

for (var i = 0; i < btns.length; i++) {
  var btn = btns[i];
  btn.addEventListener("click", function () {
    if (this.className.indexOf('active') > -1) {
      this.className = this.className.replace(" active", "");
    } else this.className += " active";
  });
}

// filter based on url
const urlParams = new URLSearchParams(window.location.search);
const url_tags = urlParams.get('tags').split(' ')
// var url_tags = window.location.href.split('#')[1].split('+')
filterSelection(url_tags)

for (var i = 0; i < btns.length; i++) {
  var btn = btns[i];
  if (url_tags.every(tag => btn.className.indexOf(tag) == -1)) {
    btn.className = btn.className.replace('active', '')
  }
}


