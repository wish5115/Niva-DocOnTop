const iconClassMap = {
    'bold': 'fa fa-bold',
    'italic': 'fa fa-italic',
    'strikethrough': 'fa fa-strikethrough',
    'heading': 'fa fa-header fa-heading',
    'heading-smaller': 'fa fa-header fa-heading header-smaller',
    'heading-bigger': 'fa fa-header fa-heading header-bigger',
    'heading-1': 'fa fa-header fa-heading header-1',
    'heading-2': 'fa fa-header fa-heading header-2',
    'heading-3': 'fa fa-header fa-heading header-3',
    'code': 'fa fa-code',
    'quote': 'fa fa-quote-left',
    'ordered-list': 'fa fa-list-ol',
    'unordered-list': 'fa fa-list-ul',
    'clean-block': 'fa fa-eraser',
    'link': 'fa fa-link',
    'image': 'fa fa-image',
    'upload-image': 'fa fa-image',
    'table': 'fa fa-table',
    'horizontal-rule': 'fa fa-minus',
    'preview': 'fa fa-eye',
    'side-by-side': 'fa fa-columns',
    'fullscreen': 'fa fa-arrows-alt',
    'guide': 'fa fa-question-circle',
    'undo': 'fa fa-undo',
    'redo': 'fa fa-repeat fa-redo',
};

const toolbar = [
    {
        name: 'bold',
        action: EasyMDE.toggleBold,
        className: iconClassMap['bold'],
        title: 'Bold',
        default: true,
    },
    {
        name: 'italic',
        action: EasyMDE.toggleItalic,
        className: iconClassMap['italic'],
        title: 'Italic',
        default: true,
    },
    {
        name: 'heading',
        action: EasyMDE.toggleHeadingSmaller,
        className: iconClassMap['heading'],
        title: 'Heading',
        default: true,
    },
    "|",
    {
        name: 'quote',
        action: EasyMDE.toggleBlockquote,
        className: iconClassMap['quote'],
        title: 'Quote',
        default: true,
    },
    {
        name: 'unordered-list',
        action: EasyMDE.toggleUnorderedList,
        className: iconClassMap['unordered-list'],
        title: 'Generic List',
        default: true,
    },
    {
        name: 'ordered-list',
        action: EasyMDE.toggleOrderedList,
        className: iconClassMap['ordered-list'],
        title: 'Numbered List',
        default: true,
    },
    {
        name: 'task-list',
        action: (editor) => {
            const cm = editor.codemirror;
            // const startPoint = cm.getCursor('start');
            // const text = cm.getLine(startPoint.line);
            cm.replaceSelection("- [ ] ");
            cm.focus();

            editor.toolbarElements['unordered-list'].classList.remove('active');

            // Update toolbar class
            editor.toolbar_div.classList.toggle('task-list');

            // Update toolbar button
            if (editor.toolbarElements && editor.toolbarElements['task-list']) {
                var toolbarButton = editor.toolbarElements['task-list'];
                toolbarButton.classList.toggle('active');
            }

        },
        className: 'fa fa-tasks',
        title: 'Task List',
        default: true,
    },
    "|",
    {
        name: 'link',
        action: EasyMDE.drawLink,
        className: iconClassMap['link'],
        title: 'Create Link',
        default: true,
    },
    {
        name: 'image',
        action: EasyMDE.drawImage,
        className: iconClassMap['image'],
        title: 'Insert Image',
        default: true,
    },
    "|",
    {
        name: 'preview',
        action: EasyMDE.togglePreview,
        className: iconClassMap['preview'],
        noDisable: true,
        title: 'Toggle Preview',
        default: true,
    },
];