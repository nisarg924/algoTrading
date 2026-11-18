import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Eye, Layers, Maximize2 } from 'lucide-react';

export default function InteractiveChart({ chartData, pivots, symbol }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Overlay Toggles
  const [showEMA9, setShowEMA9] = useState(true);
  const [showEMA21, setShowEMA21] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showPivots, setShowPivots] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || !chartData.candles || chartData.candles.length === 0) {
      return;
    }

    // Clean up existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 440,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace"
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' }
      },
      crosshair: {
        vertLine: {
          color: '#3b82f6',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b'
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b'
        }
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2
        }
      }
    });

    chartInstanceRef.current = chart;

    // 1. Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e'
    });

    const formattedCandles = chartData.candles.map(c => ({
      time: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    candleSeries.setData(formattedCandles);

    // 2. Volume Series (Histogram at bottom)
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0
        }
      });

      const volumeData = chartData.candles.map(c => ({
        time: c.date,
        value: c.volume || 1000,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'
      }));

      volumeSeries.setData(volumeData);
    }

    // 3. EMA Overlays
    const addEMALine = (history, color, width = 1) => {
      if (!history || history.length === 0) return;
      const lineSeries = chart.addLineSeries({
        color,
        lineWidth: width,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        priceLineVisible: false
      });
      const data = history.map(h => ({
        time: h.date,
        value: Number(h.value.toFixed(2))
      }));
      lineSeries.setData(data);
    };

    if (showEMA9) addEMALine(chartData.ema9, '#06b6d4', 2); // Cyan
    if (showEMA21) addEMALine(chartData.ema21, '#eab308', 2); // Yellow
    if (showEMA50) addEMALine(chartData.ema50, '#f97316', 1.5); // Orange
    if (showEMA200) addEMALine(chartData.ema200, '#a855f7', 2); // Purple

    // 4. Pivot Lines
    if (showPivots && pivots && pivots.classic) {
      const { r1, pivot, s1 } = pivots.classic;

      candleSeries.createPriceLine({
        price: r1,
        color: '#f43f5e',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'R1'
      });

      candleSeries.createPriceLine({
        price: pivot,
        color: '#eab308',
        lineWidth: 1,
        lineStyle: 1,
        axisLabelVisible: true,
        title: 'Pivot'
      });

      candleSeries.createPriceLine({
        price: s1,
        color: '#10b981',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'S1'
      });
    }

    chart.timeScale().fitContent();

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData, showEMA9, showEMA21, showEMA50, showEMA200, showVolume, showPivots, pivots]);

  return (
    <div className="rounded-2xl bg-dark-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Chart Top Controls Toolbar */}
      <div className="p-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-dark-950/60 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{symbol} Daily Candlesticks</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-[11px]">
            <span className="text-slate-400">Indicators:</span>
            <button
              onClick={() => setShowEMA9(!showEMA9)}
              className={`px-2 py-0.5 rounded font-mono transition-all ${
                showEMA9 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA 9
            </button>
            <button
              onClick={() => setShowEMA21(!showEMA21)}
              className={`px-2 py-0.5 rounded font-mono transition-all ${
                showEMA21 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA 21
            </button>
            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-2 py-0.5 rounded font-mono transition-all ${
                showEMA50 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowEMA200(!showEMA200)}
              className={`px-2 py-0.5 rounded font-mono transition-all ${
                showEMA200 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA 200
            </button>
          </div>
        </div>

        {/* Right Toggles */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded transition-all ${
              showVolume ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'bg-slate-800/40 text-slate-500'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => setShowPivots(!showPivots)}
            className={`px-2.5 py-1 rounded transition-all ${
              showPivots ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40' : 'bg-slate-800/40 text-slate-500'
            }`}
          >
            Pivot Levels
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full relative min-h-[440px]" />
    </div>
  );
}

