let rollersArr = document.getElementsByClassName("range-slider__roller");
for (let item of rollersArr) {

    let leftRoller = item.querySelector(".range-slider__roller-left");
    let rightRoller = item.querySelector(".range-slider__roller-right");
    let rangeSlider = item.closest(".range-slider")

    leftRoller.addEventListener("mousedown", leftRollerHandler);
    rightRoller.addEventListener("mousedown", rightRollerHandler);


    function leftRollerHandler(e) {
        let elem = e.target;
        let startX = item.offsetParent.getBoundingClientRect().left + item.offsetParent.clientLeft;
        let shiftX = e.clientX - elem.getBoundingClientRect().left;

        let boundaries = {
            left: 0,
            right: rightRoller.getBoundingClientRect().left - rightRoller.offsetWidth - startX
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        function onMouseMove(e) {
            e.preventDefault();

            let newLeft = e.clientX - shiftX - startX;
            newLeft = Math.max(boundaries.left, newLeft);
            newLeft = Math.min(newLeft, boundaries.right);
            item.style.left = newLeft + 'px';

            countRange();
        }

        function onMouseUp(e) {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

    }

    function rightRollerHandler(e) {
        //отсчет начинаем с правого края
        let elem = e.target;
        let startX = item.offsetParent.getBoundingClientRect().left + item.offsetParent.clientLeft +
            item.offsetParent.clientWidth;
        let shiftX = elem.getBoundingClientRect().right - e.clientX;

        let boundaries = {
            left: startX - leftRoller.getBoundingClientRect().right - rightRoller.offsetWidth,
            right: 0
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        function onMouseMove(e) {
            e.preventDefault();

            let newRight = startX - e.clientX - shiftX;
            newRight = Math.max(boundaries.right, newRight);
            newRight = Math.min(newRight, boundaries.left);
            item.style.right = newRight + 'px';

            countRange();
        }

        function onMouseUp(e) {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }
    }

    function countRange() {
        //коэффициенты 5 / 74 и 10 / 175 взяты, чтобы соответствовать масштабу макета.
        //В общем, я так и не понял, как разбить шкалу...
        let lowRange = Math.floor(5 / 74 * item.offsetLeft) * 1000;
        let topRange = Math.floor(10 / 175 * (item.offsetLeft + item.offsetWidth)) * 1000;
        
        //topRange = Math.max(lowRange, topRange); 

        lowRange = lowRange.toLocaleString('ru-RU');
        topRange = topRange.toLocaleString('ru-RU');

        rangeSlider.getElementsByClassName("range-slider__range")[0]
            .textContent = `${lowRange}\u20BD - ${topRange}\u20BD`;
    }
}