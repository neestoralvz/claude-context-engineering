'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { 
  PRINCIPLES_DATA, 
  PrincipleProcessor, 
  CATEGORY_CONFIG, 
  PrincipleCategory 
} from '@/lib/principles';

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
  principle: typeof PRINCIPLES_DATA[0];
  connections: number;
}

interface Edge {
  source: string;
  target: string;
  relationship: string;
}

interface PrincipleNetworkGraphProps {
  width?: number;
  height?: number;
  selectedCategory?: PrincipleCategory | 'all';
  highlightPrinciple?: number;
  className?: string;
}

export function PrincipleNetworkGraph({
  width = 800,
  height = 600,
  selectedCategory = 'all',
  highlightPrinciple,
  className = ''
}: PrincipleNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Filter principles based on selected category
  const filteredPrinciples = selectedCategory === 'all' 
    ? PRINCIPLES_DATA 
    : PRINCIPLES_DATA.filter(p => p.category === selectedCategory);

  // Create nodes and edges
  const createGraphData = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeMap = new Map<number, Node>();

    // Create nodes
    filteredPrinciples.forEach((principle, index) => {
      const connectionCount = (principle.crossReferences || []).filter(ref => 
        selectedCategory === 'all' || 
        filteredPrinciples.some(p => p.id === ref.principleId)
      ).length;

      const angle = (index / filteredPrinciples.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      const centerX = width / 2;
      const centerY = height / 2;

      const node: Node = {
        id: principle.id.toString(),
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: Math.max(8, Math.min(20, 8 + connectionCount * 2)),
        principle,
        connections: connectionCount
      };

      nodes.push(node);
      nodeMap.set(principle.id, node);
    });

    // Create edges
    filteredPrinciples.forEach(principle => {
      if (principle.crossReferences) {
        principle.crossReferences.forEach(ref => {
          const targetNode = nodeMap.get(ref.principleId);
          if (targetNode) {
            edges.push({
              source: principle.id.toString(),
              target: ref.principleId.toString(),
              relationship: ref.relationship
            });
          }
        });
      }
    });

    return { nodes, edges };
  };

  const { nodes, edges } = createGraphData();

  const getCategoryColor = (category: PrincipleCategory): string => {
    const colors = {
      [PrincipleCategory.PHILOSOPHICAL]: '#8B5CF6', // Purple
      [PrincipleCategory.OPERATIONAL]: '#10B981', // Green
      [PrincipleCategory.TECHNICAL]: '#3B82F6', // Blue
      [PrincipleCategory.MATHEMATICAL]: '#F59E0B', // Orange
      [PrincipleCategory.VALIDATION]: '#EF4444', // Red
      [PrincipleCategory.COGNITIVE]: '#EC4899', // Pink
      [PrincipleCategory.ADAPTATION]: '#06B6D4' // Cyan
    };
    return colors[category];
  };

  const getRelationshipColor = (relationship: string): string => {
    const colors: Record<string, string> = {
      'enables': '#10B981',
      'requires': '#EF4444',
      'optimizes': '#3B82F6',
      'validates': '#F59E0B',
      'enhances': '#8B5CF6',
      'evolves': '#06B6D4'
    };
    return colors[relationship] || '#6B7280';
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // Highlight if either node is hovered or selected
        const isHighlighted = hoveredNode === sourceNode || hoveredNode === targetNode ||
                             selectedNode === sourceNode || selectedNode === targetNode ||
                             highlightPrinciple === sourceNode.principle.id ||
                             highlightPrinciple === targetNode.principle.id;
        
        ctx.strokeStyle = isHighlighted 
          ? getRelationshipColor(edge.relationship)
          : 'rgba(156, 163, 175, 0.3)';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Draw relationship label on hover
        if (isHighlighted) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          
          ctx.fillStyle = getRelationshipColor(edge.relationship);
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(edge.relationship, midX, midY - 5);
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node;
      const isSelected = selectedNode === node;
      const isHighlighted = highlightPrinciple === node.principle.id;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      const categoryColor = getCategoryColor(node.principle.category);
      ctx.fillStyle = isHovered || isSelected || isHighlighted 
        ? categoryColor 
        : categoryColor + '80'; // Add transparency
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = isHovered || isSelected || isHighlighted 
        ? categoryColor 
        : 'rgba(156, 163, 175, 0.5)';
      ctx.lineWidth = isHovered || isSelected || isHighlighted ? 3 : 1;
      ctx.stroke();

      // Node label
      ctx.fillStyle = isHovered || isSelected || isHighlighted 
        ? '#1F2937' 
        : '#6B7280';
      ctx.font = `${isHovered || isSelected || isHighlighted ? 'bold ' : ''}11px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`#${node.principle.id}`, node.x, node.y + 4);

      // Title on hover
      if (isHovered || isSelected) {
        const textWidth = ctx.measureText(node.principle.title).width;
        const padding = 8;
        const rectWidth = textWidth + padding * 2;
        const rectHeight = 24;
        const rectX = node.x - rectWidth / 2;
        const rectY = node.y - node.radius - rectHeight - 5;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        // Text
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.principle.title, node.x, rectY + 16);
      }
    });
  };

  const getNodeAtPosition = (x: number, y: number): Node | null => {
    return nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    }) || null;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDragging && selectedNode) {
      selectedNode.x = x - dragOffset.x;
      selectedNode.y = y - dragOffset.y;
      drawGraph();
      return;
    }

    const node = getNodeAtPosition(x, y);
    if (node !== hoveredNode) {
      setHoveredNode(node);
      canvas.style.cursor = node ? 'pointer' : 'default';
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const node = getNodeAtPosition(x, y);
    if (node) {
      setSelectedNode(node);
      setIsDragging(true);
      setDragOffset({
        x: x - node.x,
        y: y - node.y
      });
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    drawGraph();
  }, [nodes, edges, hoveredNode, selectedNode, highlightPrinciple]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Principle Relationship Network
          </h3>
          <Badge variant="secondary">
            {filteredPrinciples.length} principles, {edges.length} connections
          </Badge>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h4>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.values(PrincipleCategory).map(category => {
                const config = CATEGORY_CONFIG[category];
                const hasNodes = filteredPrinciples.some(p => p.category === category);
                if (!hasNodes) return null;
                
                return (
                  <div key={category} className="flex items-center space-x-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getCategoryColor(category) }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {config.emoji} {config.name.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relationship Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Relationships</h4>
            <div className="space-y-1 text-xs">
              {['enables', 'requires', 'optimizes', 'validates', 'enhances', 'evolves'].map(rel => (
                <div key={rel} className="flex items-center space-x-1">
                  <div 
                    className="w-3 h-0.5"
                    style={{ backgroundColor: getRelationshipColor(rel) }}
                  />
                  <span className="text-gray-700 dark:text-gray-300 capitalize">
                    {rel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Hover over nodes to see details<br />
              Click and drag to move nodes<br />
              Node size = connection count
            </p>
          </div>
        </div>
      </Card>

      {/* Selected Node Details */}
      {selectedNode && (
        <Card className="p-6">
          <div className="flex items-start space-x-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: getCategoryColor(selectedNode.principle.category) }}
            >
              #{selectedNode.principle.id}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedNode.principle.title}
                </h4>
                <Badge variant="outline">
                  {CATEGORY_CONFIG[selectedNode.principle.category].name}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {selectedNode.principle.definition}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Connections: {selectedNode.connections}</span>
                <span>Category: {CATEGORY_CONFIG[selectedNode.principle.category].emoji} {CATEGORY_CONFIG[selectedNode.principle.category].name}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PrincipleNetworkGraph;