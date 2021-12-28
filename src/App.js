import React, { useState, useRef } from "react";
import "./App.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

// Column 컴포넌트
const Column = ({ children, className, title }) => {
  // children은 Column태그 사이의 값을 가리킨다.
  const [{ canDrop, isOver }, drop] = useDrop({
    // canDrop, isOver과 같이 객체안에 값이 하나라도 있어야 실행됌
    accept: "card",
    drop: () => ({ name: title }), // drop될때 실행되면서 데이터를 getDropResult로 전달해준다.
    collect: (monitor) => ({
      // collect(connect,monitor)
      isOver: monitor.isOver(), // 여기서 isOver을 수집하여서 useDrop의 isOver값을 출력할 수 있게 해준다.
      canDrop: monitor.canDrop(),
    }),
  });
  // console.log(isOver);

  return (
    <div ref={drop} className={className}>
      {title}
      {children}
    </div>
  );
};

// 움직이는 card 컴포넌트
const MovableItem = ({ name, setItems, index, moveCardHandler }) => {
  const changeItemColumn = (currentItem, columnName) => {
    setItems((prevState) => {
      return prevState.map((e) => {
        return {
          ...e,
          column: e.name === currentItem.name ? columnName : e.column,
        };
      });
    });
  };
  const ref = useRef(null); //current값 초기화값으로 null설정
  const [, drop] = useDrop({
    // 카드위에 drop되었을 때, 설정
    accept: "card",
    hover(item, monitor) {
      // console.log(ref.current);
      // card가 겹쳐질때
      if (!ref.current) {
        // hover되는 지점의 ref.current를 보여줌
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();
      // console.log(clientOffset);
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCardHandler(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });

  // isDragging은 드래그가 되었는지 여부를 Boolean값으로 출력
  const [{ isDragging }, drag, dragPreview] = useDrag({
    //useDrag는 드래그가 가능하게 만들어줌
    /*
    밑에 코드로 작성하였을 때, 에러
    https://stackoverflow.com/questions/66667906/spec-type-must-be-defined-in-react-dnd 
    */
    // item: { name: "Any custom name", type: "Irrelevant, for now" },
    type: "card",
    item: { index, name }, // 드래그 한 name값을 가리키고, end함수의 첫번째 인자로 호출할 수 있다.
    // collect: (monitor) => ({
    //   isDragging: monitor.isDragging(),
    // }),
    end: (item, monitor) => {
      // console.log("item", item);
      // 드래그가 중지되면, 호출되는 함수.
      const dropResult = monitor.getDropResult(); //
      // console.log(dropResult);
      if (dropResult && dropResult.name === "Column 1") {
        changeItemColumn(item, "Column 1");
      } else {
        changeItemColumn(item, "Column 2");
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} className="movable-item" style={{ opacity }}>
      <h2>{name}</h2>
      <p>연습중입니다</p>
    </div>
  );
};

// 최상위 컴포넌트
const App = () => {
  // const [isFirstColumn, setIsFirstColumn] = useState(true);
  // const Item = <MovableItem setIsFirstColumn={setIsFirstColumn} />;

  const [items, setItems] = useState([
    { id: 1, name: "Item 1", column: "Column 1" },
    { id: 2, name: "Item 2", column: "Column 1" },
    { id: 3, name: "Item 3", column: "Column 1" },
  ]);
  const isMobile = window.innerWidth < 600; // 화면 크기가 600미만이면 isMobile은 true

  const moveCardHandler = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];

    if (dragItem) {
      setItems((prevState) => {
        const coppieStateArray = [...prevState];
        const prevItem = coppieStateArray.splice(hoverIndex, 1, dragItem);
        coppieStateArray.splice(dragIndex, 1, prevItem[0]);

        return coppieStateArray;
      });
    }
  };

  const returnItemsForColumn = (columnName) => {
    return items
      .filter((item) => item.column === columnName)
      .map((item, idx) => (
        <MovableItem
          key={item.id}
          name={item.name}
          setItems={setItems}
          index={idx}
          moveCardHandler={moveCardHandler}
        />
      ));
  };
  return (
    <div className="container">
      {/* Wrap components that will be "draggable" and "droppable" */}
      <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
        <Column title="Column 1" className="column first-column">
          {returnItemsForColumn("Column 1")}
        </Column>
        <Column title="Column 2" className="column second-column">
          {returnItemsForColumn("Column 2")}
        </Column>
      </DndProvider>
    </div>
  );
};
export default App;
