import { GardenSpec } from "../schema/garden";
import { Node, Edge, Position, MarkerType } from 'reactflow';
import ELK from 'elkjs/lib/elk.bundled.js';
import { type ElkNode } from 'elkjs';

const elk = new ELK();

export const NODE_TYPES = {
  GARDEN: "garden",
  CATEGORY: "category",
  SUBCATEGORY: "subcategory",
  ITEM: "item"
};

const generateId = (type: string, name: string): string => {
  return `${type}-${name.toLowerCase().replace(/\s+/g, "-")}`;
};

const getNodePositions = (type: string): { sourcePosition?: Position; targetPosition?: Position } => {
  switch (type) {
    case NODE_TYPES.GARDEN:
      return { sourcePosition: Position.Bottom, targetPosition: Position.Bottom };
    case NODE_TYPES.CATEGORY:
      return { targetPosition: Position.Top, sourcePosition: Position.Bottom };
    case NODE_TYPES.SUBCATEGORY:
      return { targetPosition: Position.Top, sourcePosition: Position.Bottom };
    case NODE_TYPES.ITEM:
      return { targetPosition: Position.Top };
    default:
      return {};
  }
};

export const gardenToFlow = (garden: GardenSpec, width: number = 1600): { nodes: Node[]; edges: Edge[] } => {
  if (!garden || !garden.categories) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const centerX = width / 2;
  
  const gardenId = generateId(NODE_TYPES.GARDEN, garden.name);
  nodes.push({
    id: gardenId,
    type: NODE_TYPES.GARDEN,
    data: { 
      label: garden.name,
      version: garden.version,
      theme: garden.theme,
      icon_color: 'hsl(var(--primary))',
      icon: 'Sprout'
    },
    position: { x: centerX, y: 0 },
    ...getNodePositions(NODE_TYPES.GARDEN),
    style: { 
      background: 'hsl(var(--primary))', 
      color: 'hsl(var(--primary-foreground))',
      borderRadius: 'var(--radius)'
    }
  });
  
  garden.categories.forEach((category, categoryIndex) => {
    if (!category || !category.name) return;
    
    const categoryId = generateId(NODE_TYPES.CATEGORY, category.name);
    
    nodes.push({
      id: categoryId,
      type: NODE_TYPES.CATEGORY,
      data: { 
        label: category.name,
        icon_color: category.icon_color,
        icon: category.name.toLowerCase() === 'productivity' ? 'Zap' :
              category.name.toLowerCase() === 'development' ? 'Code' :
              category.name.toLowerCase() === 'communication' ? 'MessageSquare' :
              category.name.toLowerCase() === 'design' ? 'Palette' : 'Folder'
      },
      position: { x: centerX, y: 200 + (categoryIndex * 300) },
      ...getNodePositions(NODE_TYPES.CATEGORY)
    });
    
    edges.push({
      id: `${gardenId}-to-${categoryId}`,
      source: gardenId,
      sourceHandle: 'bottom',
      target: categoryId,
      targetHandle: 'top',
      type: 'smoothstep',
      animated: true,
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
      interactionWidth: 1
    });
    
    if (category.subcategories && Array.isArray(category.subcategories)) {
      category.subcategories.forEach((subcategory, subcategoryIndex) => {
        if (!subcategory || !subcategory.name) return;
        
        const subcategoryId = generateId(NODE_TYPES.SUBCATEGORY, subcategory.name);
        
        nodes.push({
          id: subcategoryId,
          type: NODE_TYPES.SUBCATEGORY,
          data: { 
            label: subcategory.name,
            icon_color: subcategory.icon_color,
            icon: subcategory.name.toLowerCase().includes('task') ? 'CheckSquare' :
                  subcategory.name.toLowerCase().includes('note') ? 'FileText' :
                  subcategory.name.toLowerCase().includes('code') ? 'Code2' :
                  subcategory.name.toLowerCase().includes('version') ? 'Git' :
                  subcategory.name.toLowerCase().includes('message') ? 'MessageCircle' :
                  subcategory.name.toLowerCase().includes('video') ? 'Video' :
                  subcategory.name.toLowerCase().includes('ui') ? 'Layout' :
                  subcategory.name.toLowerCase().includes('graphics') ? 'Image' : 'Folder'
          },
          position: { x: centerX, y: 200 + (categoryIndex * 300) + ((subcategoryIndex + 1) * 150) },
          ...getNodePositions(NODE_TYPES.SUBCATEGORY)
        });
        
        edges.push({
          id: `${categoryId}-to-${subcategoryId}`,
          source: categoryId,
          sourceHandle: 'bottom',
          target: subcategoryId,
          targetHandle: 'top',
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed },
          interactionWidth: 1
        });
        
        if (subcategory.items && Array.isArray(subcategory.items)) {
          subcategory.items.forEach((item, itemIndex) => {
            if (!item || !item.name) return;
            
            const itemId = generateId(NODE_TYPES.ITEM, item.name);
            
            nodes.push({
              id: itemId,
              type: NODE_TYPES.ITEM,
              data: { 
                label: item.name,
                homepage_url: item.homepage_url || '',
                logo: item.logo || '',
                image: item.logo || 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
                repo_url: item.repo_url || '',
                description: item.description || "",
                cta: {
                  primary: {
                    label: 'Visit Website',
                    url: item.homepage_url || ''
                  },
                  secondary: item.repo_url ? {
                    label: 'View Code',
                    url: item.repo_url
                  } : undefined
                }
              },
              position: { x: centerX, y: 200 + (categoryIndex * 300) + ((subcategoryIndex + 1) * 150) + ((itemIndex + 1) * 100) },
              ...getNodePositions(NODE_TYPES.ITEM)
            });
            
            edges.push({
              id: `${subcategoryId}-to-${itemId}`,
              source: subcategoryId,
              sourceHandle: 'bottom',
              target: itemId,
              targetHandle: 'top',
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 },
              markerEnd: { type: MarkerType.ArrowClosed },
              interactionWidth: 1
            });
          });
        }
      });
    }
  });
  
  return { nodes, edges };
};

export const autoLayout = async (nodes: Node[], edges: Edge[]): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  if (!nodes?.length || !edges?.length) {
    return { nodes: nodes || [], edges: edges || [] };
  }

  try {
    const graph = {
      id: 'elk-root',
      layoutOptions: {
        'elk.algorithm': 'mrtree',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '150',
        'elk.layered.spacing.nodeNodeBetweenLayers': '150',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX'
      },
      children: nodes.map((node) => ({
        id: node.id,
        width: 200,
        height: 80,
        layoutOptions: {
          'elk.position': node.type === NODE_TYPES.GARDEN ? 'ROOT' : undefined
        }
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
        layoutOptions: {
          'elk.layered.edge.thickness': '2',
          'elk.edgeRouting': 'ORTHOGONAL'
        }
      }))
    };

    // Layout the graph
    const root = await elk.layout(graph);
    const layoutNodes = new Map<string, ElkNode>();
    
    for (const node of root.children ?? []) {
      if (node) {
        layoutNodes.set(node.id, node);
      }
    }

    // Update positions while preserving node properties
    const nextNodes = nodes.map((node) => {
      const elkNode = layoutNodes.get(node.id);
      if (!elkNode || typeof elkNode.x !== 'number' || typeof elkNode.y !== 'number') {
        return node;
      }
      
      const position = { x: elkNode.x, y: elkNode.y };
      const nodePositions = getNodePositions(node.type as string);

      // Preserve the original node type and connection points
      return {
        ...node,
        position,
        ...nodePositions,
        data: {
          ...node.data,
          sourcePosition: nodePositions.sourcePosition,
          targetPosition: nodePositions.targetPosition
        }
      };
    });

    // Update edges with the new node positions
    const nextEdges = edges.map(edge => ({
      ...edge,
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5 }
    }));

    return { nodes: nextNodes, edges: nextEdges };
  } catch (error) {
    console.error('Error during layout:', error);
    return { nodes, edges };
  }
};