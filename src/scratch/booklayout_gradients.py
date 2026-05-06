import sys

file_path = r'd:\MY PROJECTS\Project-Management-System\src\components\BookLayout.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

universal_gradient = "from-[#FF0080] to-[#7928CA]"
gradient_classes = f"bg-gradient-to-r {universal_gradient} bg-clip-text text-transparent"

# 1. Main Project Title
content = content.replace(
    '<h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{project.name}</h1>',
    f'<h1 className="text-3xl font-black {gradient_classes} tracking-tighter uppercase">{{project.name}}</h1>'
)

# 2. Project Stats Header in sidebar
content = content.replace(
    '<h4 className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-4 tracking-tighter">Project Stats</h4>',
    f'<h4 className="text-[10px] font-black uppercase {gradient_classes} mb-4 tracking-tighter">Project Stats</h4>'
)

# 3. Stats numbers in Overview cards
content = content.replace(
    'className="text-3xl font-black text-[var(--text-primary)]"',
    f'className="text-3xl font-black {gradient_classes}"'
)

# 4. Project Overview Heading
content = content.replace(
    '<h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Project Overview</h3>',
    f'<h3 className="text-2xl font-black {gradient_classes} mb-2 uppercase">Project Overview</h3>'
)

# 5. Metadata Edit Modal Title
content = content.replace(
    '<h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight uppercase">Edit Project</h3>',
    f'<h3 className="text-lg font-black {gradient_classes} tracking-tight uppercase">Edit Project</h3>'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Gradients applied to BookLayout.")
