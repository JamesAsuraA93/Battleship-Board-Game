"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"

type GridState = boolean[][]
type HitState = boolean[][]
type ShootingMode = "red" | "blue" | null

export default function BattleshipGrid() {

  const [gridSize, setGridSize] = useState(5)

  const [redGrid, setRedGrid] = useState<GridState>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false)),
  )
  const [blueGrid, setBlueGrid] = useState<GridState>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false)),
  )

  const [redHits, setRedHits] = useState<HitState>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false)),
  )
  const [blueHits, setBlueHits] = useState<HitState>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false)),
  )

  useEffect(() => {
    const emptyGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false))
    setRedGrid(emptyGrid)
    setBlueGrid(emptyGrid)
    setRedHits(emptyGrid)
    setBlueHits(emptyGrid)
  }, [gridSize])

  const [redHidden, setRedHidden] = useState(false)
  const [blueHidden, setBlueHidden] = useState(false)

  const [shootingMode, setShootingMode] = useState<ShootingMode>(null)
  const [message, setMessage] = useState("")
  const [gameOver, setGameOver] = useState(false)

  const handleCellClick = (team: "red" | "blue", row: number, col: number) => {
    if (gameOver) return

    // If in shooting mode and clicking on opponent's board
    if (shootingMode) {
      const isOpponentBoard = (shootingMode === "red" && team === "blue") || (shootingMode === "blue" && team === "red")

      if (!isOpponentBoard) {
        setMessage(
          `${shootingMode === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} กำลังยิง กรุณาคลิกที่บอร์ดของฝั่ง${shootingMode === "red" ? "น้ำเงิน" : "แดง"}`,
        )
        return
      }

      shoot(shootingMode, row, col)
      return
    }

    // Normal ship placement mode
    if (team === "red") {
      setRedGrid((prev) => {
        const newGrid = prev.map((r) => [...r])
        newGrid[row][col] = !newGrid[row][col]
        return newGrid
      })
    } else {
      setBlueGrid((prev) => {
        const newGrid = prev.map((r) => [...r])
        newGrid[row][col] = !newGrid[row][col]
        return newGrid
      })
    }
  }

  const resetGrid = (team: "red" | "blue") => {
    const emptyGrid = Array(5)
      .fill(null)
      .map(() => Array(5).fill(false))
    if (team === "red") {
      setRedGrid(emptyGrid)
      setRedHits(emptyGrid)
    } else {
      setBlueGrid(emptyGrid)
      setBlueHits(emptyGrid)
    }
    setGameOver(false)
    setMessage("")
  }

  const startNewGame = () => {
    const emptyGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false))
    
    
    setRedGrid(emptyGrid)
    setBlueGrid(emptyGrid)
    setRedHits(emptyGrid)
    setBlueHits(emptyGrid)
    setRedHidden(false)
    setBlueHidden(false)
    setShootingMode(null)
    setMessage("")
    setGameOver(false)
  }

  const shoot = (shooter: "red" | "blue", row: number, col: number) => {
    if (gameOver) return

    const targetGrid = shooter === "red" ? blueGrid : redGrid
    const targetHits = shooter === "red" ? blueHits : redHits
    const setTargetHits = shooter === "red" ? setBlueHits : setRedHits

    // const columns = ["A", "B", "C", "D", "E"]
    // const columns = Array.from({ length: gridSize }, (_, i) => String.fromCharCode(65 + i)) // Generate columns A, B, C, ...
    // const coordinate = `${columns[col]}${row + 1}`
    const coordinate = `${String.fromCharCode(65 + col)}${row + 1}`


    // Check if already shot this position
    if (targetHits[row][col]) {
      setMessage(`${shooter === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} ยิงตำแหน่งนี้ไปแล้ว!`)
      setShootingMode(null)
      return
    }

    // Mark as shot
    setTargetHits((prev) => {
      const newHits = prev.map((r) => [...r])
      newHits[row][col] = true
      return newHits
    })

    if (targetGrid[row][col]) {
      setMessage(`🎯 ${shooter === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} ยิงโดน! ที่ ${coordinate}`)

      // Check if all ships are destroyed
      const remainingShips = targetGrid.flat().filter((hasShip, index) => {
        const r = Math.floor(index / gridSize)
        const c = index % gridSize
        return hasShip && !targetHits[r][c] && !(r === row && c === col)
      }).length

      if (remainingShips === 0) {
        setGameOver(true)
        setMessage(
          `🏆 ${shooter === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} ชนะ! ${shooter === "red" ? "ฝั่งน้ำเงิน" : "ฝั่งแดง"}แพ้เพราะเรือหมดแล้ว!`,
        )
      }
    } else {
      setMessage(`❌ ${shooter === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} ยิงพลาด! เสียกระสุนที่ ${coordinate}`)
    }

    setShootingMode(null)
  }

  const Grid = ({
    grid,
    hits,
    team,
    isHidden,
  }: {
    grid: GridState
    hits: HitState
    team: "red" | "blue"
    isHidden: boolean
  }) => {
    const bgColor = team === "red" ? "bg-red-500" : "bg-blue-500"
    const hoverColor = team === "red" ? "hover:bg-red-600" : "hover:bg-blue-600"
    // const columns = ["A", "B", "C", "D", "E"]
    const columns = Array.from({ length: gridSize }, (_, i) => String.fromCharCode(65 + i)) // Generate columns A, B, C, ...
    const rows = Array.from({ length: gridSize }, (_, i) => (i + 1).toString()) // Generate rows 1, 2, 3, ...
    // const rows = ["1", "2", "3", "4", "5"]

    const isTargetBoard =
      shootingMode && ((shootingMode === "red" && team === "blue") || (shootingMode === "blue" && team === "red"))

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-2xl font-bold ${team === "red" ? "text-red-500" : "text-blue-500"}`}>
            {team === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => (team === "red" ? setRedHidden(!redHidden) : setBlueHidden(!blueHidden))}
              className="px-4 py-2 text-sm bg-muted hover:bg-accent rounded-lg transition-colors flex items-center gap-2"
            >
              {isHidden ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>แสดงเรือ</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>ซ่อนเรือ</span>
                </>
              )}
            </button>
            <button
              onClick={() => resetGrid(team)}
              className="px-4 py-2 text-sm bg-muted hover:bg-accent rounded-lg transition-colors"
            >
              ล้างทั้งหมด
            </button>
          </div>
        </div>

        {/* Grid with coordinates */}
        <div className="inline-flex flex-col gap-1">
          {/* Column headers */}
          <div className="flex gap-1 ml-8">
            {columns.map((col) => (
              <div key={col} className="w-12 h-6 flex items-center justify-center font-bold text-sm">
                {col}
              </div>
            ))}
          </div>

          {/* Grid rows with row numbers */}
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {/* Row number */}
              <div className="w-6 h-12 flex items-center justify-center font-bold text-sm">{rows[rowIndex]}</div>

              {/* Grid cells */}
              {row.map((hasShip, colIndex) => {
                const isHit = hits[rowIndex][colIndex]
                const showShip = hasShip && !isHidden

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(team, rowIndex, colIndex)}
                    disabled={gameOver}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all
                      ${
                        showShip
                          ? `${bgColor} border-transparent scale-95`
                          : "bg-muted border-border hover:border-foreground/50"
                      }
                      ${showShip ? "" : hoverColor + " hover:opacity-50"}
                      ${isHit && hasShip ? "ring-4 ring-red-600" : ""}
                      ${isHit && !hasShip ? "ring-2 ring-gray-400" : ""}
                      ${isTargetBoard ? "ring-4 ring-yellow-400 cursor-crosshair" : ""}
                      flex items-center justify-center text-xl relative
                      ${gameOver ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {showShip && "🚢"}
                    {isHit && hasShip && <span className="absolute text-3xl">💥</span>}
                    {isHit && !hasShip && <span className="absolute text-lg">💧</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            onClick={() => {
              if (shootingMode === team) {
                setShootingMode(null)
                setMessage("")
              } else {
                setShootingMode(team)
                setMessage(`${team === "red" ? "ฝั่งแดง" : "ฝั่งน้ำเงิน"} กดที่บอร์ดฝั่ง${team === "red" ? "น้ำเงิน" : "แดง"}เพื่อยิง`)
              }
            }}
            disabled={gameOver}
            className={`
              w-full px-4 py-3 text-sm font-semibold rounded-lg transition-all
              ${
                shootingMode === team
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black ring-4 ring-yellow-300"
                  : team === "red"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {shootingMode === team ? "❌ ยกเลิกการยิง" : "🎯 ยิงกระสุนไปฝั่ง" + (team === "red" ? "น้ำเงิน" : "แดง")}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8 items-center justify-center w-full">
      <div className="w-full max-w-8xl mx-auto flex flex-col gap-6 items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-4">เกมวางเรือ {gridSize}x{gridSize}</h1>
        <p className="text-center text-muted-foreground mb-4">คลิกที่ช่องเพื่อวางเรือ คลิกอีกครั้งเพื่อลบเรือ</p>

        <div className="flex justify-center mb-4 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
          >
            🔄 รีเฟรชหน้าเว็บ
          </button>

          <button
            onClick={startNewGame}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            🔄 เริ่มเกมใหม่
          </button>

          <div className="flex items-center justify-center">
            <label className="font-medium">ขนาดตาราง:</label>
            <Input type="number" min={5} max={26} value={gridSize} onChange={(e) => {
              if (e.target.value === "") return
              if (Number(e.target.value) < 5) return setGridSize(5)
              if (Number(e.target.value) > 26) return setGridSize(26)
              setGridSize(Number(e.target.value))
              }} className="w-16">
            </Input>
          </div>
        </div>

        {/* Message display */}
        {message && (
          <div
            className={`text-center mb-6 p-4 rounded-lg ${gameOver ? "bg-green-500/20 text-green-600 font-bold text-xl" : "bg-blue-500/20 text-blue-600"}`}
          >
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 w-fit mx-auto">
          <Card className="p-6">
            <Grid grid={redGrid} hits={redHits} team="red" isHidden={redHidden} />
          </Card>

          <Card className="p-6">
            <Grid grid={blueGrid} hits={blueHits} team="blue" isHidden={blueHidden} />
          </Card>
        </div>

        <div className="w-full flex items-center justify-center p-10">
          <h1>สร้างโดย <a href="https://www.instagram.com/jaemsc.jrcn" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">IG : Jaemsc.Jrcn</a></h1>
          <p>&nbsp;|&nbsp; <a href="https://github.com/JamesAsuraA93" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub : JamesAsuraA93</a></p>
        </div>
      </div>
    </div>
  )
}
