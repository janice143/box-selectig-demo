import { Button } from "antd";
import { useCallback, useEffect, useState } from "react";
import "../styles.css";

/**
 * FIXME: 选取别的区域了，要重置selection
 */

export const CELL_WIDTH = 15; // 单位px

const Board = ({ m = 48, n = 2 }) => {
  const resetBoard = () => {
    return Array.from({ length: n }).map(() =>
      Array.from({ length: m }).fill(0)
    );
  };

  const resetSelection = () => {
    return {
      startRow: -1,
      startCol: -1,
      endRow: -1,
      endCol: -1,
      selectingRef: false // 是否正在选择（着色）
    };
  };

  const [selection, setSelection] = useState(resetSelection());

  const [board, setBoard] = useState(resetBoard());

  useEffect(() => {
    // 鼠标抬起, 才更新board
    if (selection.selectingRef) return;
    updateBoard();
  }, [selection.selectingRef]);

  const updateBoard = () => {
    const boardCopy = JSON.parse(JSON.stringify(board));
    // 每次变动的只是当前选中的坐标内部的单元格
    boardCopy.forEach((temp: any, row: any) =>
      temp.forEach((_: any, col: any) => {
        const isSelect = isSelected(row, col);
        // 如果已经是1，且在选中区域内，那么不着色；不在选中区域内则保持现状
        if (boardCopy[row][col]) {
          if (isSelectingArea(row, col)) {
            boardCopy[row][col] = 0;
          }
          return;
        }
        boardCopy[row][col] = isSelect;
      })
    );
    setBoard([...boardCopy]);
  };

  const beginSelection = (row: number, col: number) => {
    // slidingRef.current = false;

    setSelection((pre) => ({
      ...pre,
      startRow: row,
      startCol: col,
      selectingRef: true
    }));
  };

  const endSelection = (row: number, col: number) => {
    setSelection((pre) => ({
      ...pre,
      endRow: row,
      endCol: col,
      selectingRef: false
    }));
  };

  /**
   * 滑动选择事件
   * @param row
   * @param col
   */
  const handleCellMouseDrag = (row: number, col: number) => {
    // slidingRef.current = true;
    const { endRow, endCol } = selection;
    const isNew = endRow !== row || col !== endCol;
    if (selection.selectingRef && isNew) {
      setSelection((prevSelection) => ({
        ...prevSelection,
        endRow: row,
        endCol: col
      }));
    }
  };

  /**
   * 当前未知的单元格是否被选中
   * @param row 当前行
   * @param col 当前列`
   * @returns
   */
  const isSelected = useCallback(
    (row: number, col: number) => {
      const { startRow, startCol } = selection;

      if (startRow === -1 || startCol === -1) {
        return 0;
      }

      // 根据规则，如果在当前选中区域内，如果初始下落点，那么着色状态为0
      if (isSelectingArea(row, col)) {
        const fill = board[startRow][startCol];
        if (fill) return 0;
        return 1;
      }
      return 0;
    },
    [selection]
  );

  /**
   * 当前坐标是否在当前选中区域内
   * @param row
   * @param col
   * @returns
   */
  const isSelectingArea = (row: number, col: number) => {
    const { startRow, startCol, endRow, endCol } = selection;
    return (
      row >= Math.min(startRow, endRow) &&
      row <= Math.max(startRow, endRow) &&
      col >= Math.min(startCol, endCol) &&
      col <= Math.max(startCol, endCol)
    );
  };

  return (
    <div>
      <Button
        onClick={() => {
          setBoard(resetBoard());
          setSelection(resetSelection());
        }}
      >
        清空选择
      </Button>
      {board.map((temp, row) => (
        <div
          key={row}
          style={{
            display: "flex"
          }}
        >
          {temp.map((value, col) => {
            // console.log(111)
            return (
              <div
                key={`${row}-${col}`}
                onMouseMove={() => handleCellMouseDrag(row, col)}
                onMouseDown={() => beginSelection(row, col)}
                onMouseUp={() => endSelection(row, col)}
                // 当区域内的着色由isSelected(row, col)实时控制
                className={
                  (isSelectingArea(row, col) ? isSelected(row, col) : value)
                    ? "selected"
                    : ""
                }
                style={{
                  height: "80px",
                  width: `${CELL_WIDTH}px`,
                  border: "0.5px solid #f0f0f0",
                  boxSizing: "border-box"
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
