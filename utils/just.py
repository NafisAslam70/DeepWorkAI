from graphviz import Digraph

# System Overview Diagram in Graphviz
dot = Digraph(comment='System Overview')

# Nodes
dot.node('Frontend', 'Frontend\n(React.js)', shape='box', style='filled', fillcolor='lightblue')
dot.node('Backend', 'Backend\n(Flask, Next.js)', shape='box', style='filled', fillcolor='lightgreen')
dot.node('Database', 'Database\n(Postgres)', shape='box', style='filled', fillcolor='lavender')
dot.node('AI_Module', 'AI Module\n(YOLOv5)', shape='box', style='filled', fillcolor='salmon')

# Edges
dot.edge('Frontend', 'Backend', label='User Inputs')
dot.edge('Backend', 'Database', label='Data Storage')
dot.edge('Backend', 'AI_Module', label='Request Processing')

# Save and render
file_path = '/mnt/data/System_Overview_Diagram'
dot.render(file_path, format='png', cleanup=True)

file_path
