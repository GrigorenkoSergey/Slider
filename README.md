# Slider
## [Демо-страница слайдера: ](https://grigorenkosergey.github.io/sliderDemo/index.html)

## Подключение 
Клонируй одним из возможных способов:  
`git clone https://github.com/GrigorenkoSergey/Slider.git`  
`git clone git@github.com:GrigorenkoSergey/Slider.git`  
Или просто скачай [ZIP архив](https://github.com/GrigorenkoSergey/Slider/archive/master.zip).

Далее 3 возможных варианта подключения.
1. Полный проект с использованием **webpack**.    
    Развертывание.  
    Зайди в установленную директорию (*Slider*) и выполни команду
    `npm install`  
    Если выдаст ошибку, попробуй переустановить ***babel-loader*** командами  
    `npm uninstall babel-loader @babel/core @babel/preset-env`  
    `npm install -D babel-loader @babel/core @babel/preset-env`

    Запуск webpack-dev-server  
    `npm run dev`  
    Запуск production build  
    `npm run build`

2. Использование только файлов непосредственно слайдера, опять с **webpack**.
    Скопируй куда тебе удобно содержимое папки ***dist/slider*** и импортируй из нее файлы slider.js и slider.css (slider.html трогать не нужно).
    ```js
    // твой js-файл
    import {Slider} from '../path/to/directory/slider/slider.js';
    import '../path/to/directory/slider/slider.css';
    ```

3. По старинке. Добавь стили **slider.css**  и **slider.js** в тэг *head* в конце тега *body* подключи скрипт, который будет его использовать. Доступ только через *jquery* (отдельно подключать нет необходимости).
    ```html
    <html>
        <head>
            <link href="../path/to/directory/slider/slider.css" rel="stylesheet" type="text/css">
            <script src="../path/to/directory/slider/slider.js"></script>
        </head>
        <body>
          <div class="slider"></div>
          <script>
            let options = {
              //some options here...
            };

            let slider = $('.slider').slider(options);
          </script>
        </body>
    </html>
    ```
Исходники js-кода и стилей лежат в ***src/assets/blocks/slider***.

## Структура проекта
```
.
├── coverage
├── dist
├── karma.conf.js
├── node_modules
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
|
├── src
│   ├── assets
|   │   ├── blocks
|   |   |   |
|   |   |   ├── helpers
|   |   |   │   ├── debugger-point.ts
|   |   |   │   ├── event-observer.ts
|   |   |   │   ├── functions
|   |   |   │   │   └── is-increasing.ts
|   |   |   │   ├── interfaces.ts
|   |   |   │   └── types.ts
|   |   |   |
|   |   |   ├── main-page
|   |   |   │   ├── components
|   |   |   │   │   ├── binded-input.ts
|   |   |   │   │   └── slider-options-palette.ts
|   |   |   │   ├── main-page.pug
|   |   |   │   ├── main-page.scss
|   |   |   │   └── main-page.ts
|   |   |   |
|   |   |   ├── slider
|   |   |   │   ├── components
|   |   |   │   │   ├── model
|   |   |   │   │   │   └── model.ts
|   |   |   │   │   └── view
|   |   |   │   │       ├── components
|   |   |   │   │       │   ├── scale.ts
|   |   |   │   │       │   ├── stretcher.ts
|   |   |   │   │       │   └── thumbs-twins-brothers.ts
|   |   |   │   │       └── view.ts
|   |   |   │   ├── jquery.slider.d.ts
|   |   |   │   ├── slider.pug
|   |   |   │   ├── slider.scss
|   |   |   │   └── slider.ts
|   |   |   |
|   |   |   └── template
|   |   |       ├── template.js
|   |   |       ├── template.pug
|   |   |       └── template.scss
|   │   |
|   │   ├── fonts
|   │   └── images
|   |   
│   ├── index.pug
│   ├── index.ts
│   └── postcss.config.js
|
├── test
│   ├── helpers-spec.ts
│   ├── model-spec.ts
│   ├── slider.css
│   ├── slider.scss
│   ├── slider-spec.ts
│   └── view-spec.ts
├── tsconfig.json
└── webpack.config.js
```

## Использование
Сам слайдер должен находиться в каком-либо блоке (*div*). Возможны 3 варианта вызова: 
```js 
    let slider = new Slider(options); //только с webpack
    let slider = $(selector).slider(options); //c jquery
    let slider = $().slider(options); //с jquery, селектор находится в options.
```
В объекте настроек, передаваемых параметром **options** есть поле **selector**, в которое необходимо записать селектор выбора, аналогичный тому, что мы передаем через ```document.body.querySelector(selector)``` или через ```$(selector)```.

## Обязательные опции  
### min
Минимальное значение шкалы диапазона
### max 
Максимальное значение шкалы диапазона
### selector  
CSS-селектор выбора блока, содержащего наш слайдер

## Дополнительные опции
### className: *string*  
По умолчанию **"slider"**. Это имя блока, именованного по методологии BEM, который будет сгенерирован в контейнере со своими элементами. К нему привязаны стили слайдера. При необходимости изменить стили поправь исходный (S)?CSS файл. Если возможен конфликт имен, просто переименуй приставку **"slider"** в стилях, на любое имя, заданное в этом свойстве, например на **"superMegaCoolSlider"**.

### range: *boolean*
По умолчанию *false*. Отображение одного или двух бегунков.

### hintAboveThumb: *boolean*
По умолчанию *true*. Отображение подсказки над кругляшом при клике на нем и его передвижении.

### angle: *number*
По умолчанию 0. Поворот слайдера. Принимает значения от 0 до 90.

### showScale: *boolean*
По умолчанию *true*. Под слайдером отображаются крайние значения шкалы, равные *min* или *max*. При щелчке по ним ближайший кругляш бежит к этому пределу. При желании можно поменять отображение пределов с помощью свойства *rangeValue*.

### rangeValue: [leftLimit: *string* | *number*, rightLimit: *string* | *number*]
По умолчанию пустой массив. Поменять значения, отображаемые шкалой при *showScale: true*. Нужна для продвинутых настроек.

### ticks: *object*
Замудренная опция, нужная для настройки нелинейной шкалы. Проще объяснить на примере.  
Предположим, у нас в магазине товары стоимостью от 100 до 20000 рублей. Количество товаров по цене до 500 рублей - 100 штук, до 10000 рублей - 150 штук (включая товары дешевле 500 рублей), до 20000 уже 180 штук. Предположим, что от положения бегунка зависит количество показываемых единиц товара. Подавляющее большинство товаров находится в диапазоне до 500 рублей.  
Некорректно будет использовать линейную шкалу, т.к. мы только сдвинули бегунок с начала, и уже страница показывает почти все доступные товары, что делает наш бегунок доволько бессмысленным. Логично, чтобы на половине шкалы можно было бы выбирать среди товаров в ценовом диапазоне до 500 рублей, а на другой половине от 10000 до 20000 рублей. Тогда мы должны задать параметр ticks следующего вида: 
```js
ticks = { 500: 100, 10000: 150, 20000: 180 }.
```

### thumbLeftPos: *number*
Задание положения левого бегунка в единицах основной шкалы. Нельзя задать больше максимума и меньше минимума, значения будут пересчитаны автоматически в соответствии с пределами.

### thumbRightPos: *number*
Задание положения правого бегунка (если показан) в единицах основной шкалы. Нельзя задать больше максимума и меньше минимума, значения будут пересчитаны автоматически в соответствии с пределами.

### hintEl: *HTMLDivElement*
Дополнительное свойство, не отображается командой **getOptions()**. Сcылка на элемент подсказки. Нужна для продвинутых настроек.


## API
## Основные методы
### getOptions()
Используется для того, чтобы узнать значения опций слайдера. Возвращает объект со значениями опций.

### setOptions(options)
Настройка доступных опций на лету. Возвращает объект слайдера.
Пример:
```js
slider.setOptions({range: true, max: -100});
```

### setThumbsPos(left: *number*, right: *number*)
Краткий вызов для метода 
```js
setOptions({thumbLeftPos: left, thumbRighPos: right})
```
Параметры *left* и *right* должны быть заданы в абсолютных единицах шкалы.
Первый аргумент обязателен. Возвращает объект слайдера.

## Продвинутые методы
### bindWith(elemDom, fnStart, fnEnd, fnRes)
Сам по себе бегунок бесполезен. Он должен быть связан с какими-либо данными и его перемещение должно вызывать какие-то дополнительные  полезные действия. К примеру, пользователь, двигая кругляш, меняет возможные значения срока ипотеки. Какая-то сторонняя функция высчитывает итоговую сумму, которую он заплатит и отображает в каком-то поле *elemDom*. Таких элементов может быть сколько угодно.

### Принимаемые параметры:
### elemDom: *HTMLElement*
Элемент, характеристики которого мы связываем с положением бегунка (см. примеры ниже)
### fnStart: *number*
Какое-то начальное значение, которое соответствует *min* бегунка.
### fnEnd: *number*
Какое-то конечное значение, которое соответствует *max* бегунка.
### fnRes: *function*
Функция, описывающая как *elemDom* должен реагировать на движение бегунка.
Она, в свою очередь, имеет такую сигнатуру:
### function name(*elem, leftX, scaledLeftX, rightX, scaledRightX, data*) {}

### Параметры:
### elem: *HTMLElement*
Элемент, который мы связали с бегунком.
### leftX: *number*
Значение, соответствующее положению левого бегунка в единицах основной шкалы. Оно же значение свойства "*thumbsLeft*".
### scaledLeftX: *number*
Значение, соответствующее положению левого бегунка в единицах шкалы, диапазон которой мы задавали, когда связывали DOM-элемент cо слайдером.
### rightX: *number*
То же, что и *leftX*, только для правого бегунка.
### scaledRightX: *number*
То же, что и *scaledLeftX*, только для правого бегунка.
### data: *object*
В некоторых случаях потребуется узнать, какая информация к нам поступает от слайдера. Она может быть вида: 
```js 
{"L": {x: number, offset: number}, "R": {x: number, offset: number}}//если мы меняем положение бегунков с помощью javascript.

{el: "L" | "R", offset: number}//если двигаем бегунок мышкой.
```

### unbindFrom(elemDom)
В противоположность функции **bindWith** отвязывает элемент DOM от бегунка.

## uml-диаграмма
![](./src/assets/images/uml.png)

## Примеры продвинутых настроек 
### Пример1. Птичка (см. демо-страницу, последний пример).
Пусть в DOM у нас имеется элемент ```<div class="slider7></div> ```  
Картинка imgSprite - это спрайт, состоящий из 14 картинок по 5 в ряду, 3 ряда.  
Высота спрайта 506 пикселей, ширина 918.  
Упрощенно можно рассмотреть спрайт как двумерную матрицу 3x5, где каждая ячейка - картинка.  
Тогда в js-файле указываем:
```js
let options7 = {
    max: 1000,
    min: 0,
    step: 10,
    selector: ".slider7",
    angle: 0,
    range: false,
    hintAboveThumb: true
}

// let slider7 = new Slider(options7); 
let slider7 = $().slider(options7);

let fnResBird = (elem, leftX, resLeft) => {
    let imgWidth = 918 / 5;
    let imgHeight = 506 / 3;
    resLeft = Math.round(resLeft); //номер картинки

    let offsetLeft = imgWidth * (resLeft % 5);
    let offsetTop = imgHeight * Math.floor(resLeft / 5);

    elem.style.backgroundPositionX = -offsetLeft + "px";
    elem.style.backgroundPositionY = -offsetTop + "px";
}

slider7.bindWith(document.querySelector('.imgSprite'), 0, 13, fnResBird); 
```
Итого у нас один бегунок, положение которого мы связали с номером картинки.
Крайнее левое положение отображает первую картинку (нумерация с нуля), в крайнем правом положении мы отображаем последнюю 14-ю картинку (с индексом 13).

### Пример2. Месяцы (наклонный слайдер)
Мы хотим, чтобы шкала отображала какой-то временной период, например, год.
Тогда мы должны задать опцию rangeValue с границами периода. 
Поместим наш слайдер в блок с классом "slider3".
```js
let options3 = {
    min: 0,
    max: 1000,
    step: 1,
    selector: ".slider3",
    angle: 45,
    range: true,
    hintAboveThumb: true,
    rangeValue: ["Jan", "Dec"],
}

// let slider3 = new Slider(options3);
let slider3 = $('.slider3').slider(options3);

//По умолчанию, подсказка над бегунком показывает значение, привязанное к основной шкале.
//Отвяжем нашу подсказку от него.
slider3.unbindFrom(slider3.hintEl);

let fnMonths = (elem, leftX, scaledLeftX, rightX, scaledRightX, data) => {
    let months = ["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //подсказка появляется только при фокусировке на кругляше,
    //поэтому data будет формата {el: "L"|"R", offset: number}

    if (data.el == "L") { //Двигают левый кругляш
        elem.textContent = months[Math.round(scaledLeftX)];
    } else { //Двигают правый кругляш
        elem.textContent = months[Math.round(scaledRightX)];
    }
}
slider3.bindWith(slider3.hintEl, 0, 11, fnMonths);
```
Полный код примеров смотри в ***src/main-page/main-page.ts***.
