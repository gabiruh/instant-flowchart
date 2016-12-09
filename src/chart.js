var typing_timeout;
var previous_tree;
var content;
var _code = document.getElementById('code');
var chart = d3.select("#chart").append("svg").append('g');
var renderer = new dagreD3.render();

function parse_code(event) {
  var previous_content = content;
  content = _code.value;

  if (previous_content && (previous_content == _code.value)) return;

  var tree;
  try {
    tree = Grammar.parse(_code.value);
  } catch (err) {
    console.log('error: ', err);
  };

  if (tree) render(tree)
}

var _grapher = {
  start: function(graph, node) {},
  end: function(graph, node) {},
  statement: function(graph, node) {
    graph.setNode(node, {
      label: node.content
    });
    return graph;
  },
  condition: function(graph, node) {},
  loop: function(graph, node) {},
  comment: function(graph, node) {},
};



function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
var grapher = {
  start: function(graph, node) {
    node.guid = node.guid || guid();
    graph.setNode(node.guid, {
      label: node.content,
      class: node.type,
      shape: 'ellipse'
    });
    return node;
  },
  end: function(graph, node) {
    node.guid = node.guid || guid();
    graph.setNode(node.guid, {
      label: node.content,
      class: node.type
    });
    return node;
  },
  statement: function(graph, node) {
    node.guid = node.guid || guid();
    graph.setNode(node.guid, {
      label: node.content,
      class: node.type,
      shape: 'rect'
    });
    return node;
  },
  condition: function(graph, node) {
    node.guid = node.guid || guid();
    graph.setNode(node.guid, {
      label: node.test + '?',
      class: node.type,
      shape: 'diamond'
    });
    var last = traverse(graph, [null].concat(node.block));
    graph.setEdge(node.guid, node.block[0].guid, { label: 'Sim'} );

    var tail = [node, last];
    if(node.alternate){
      var last_alternative  = traverse(graph, [null].concat(node.alternate));
      graph.setEdge(node.guid, node.alternate[0].guid, { label: 'Sim'} );
      tail.push(last_alternative);

    }
    return tail;

  },
  loop: function(graph, node) {
    node.guid = node.guid || guid();
    graph.setNode(node.guid, {
      label: node.test + '?',
      class: node.type,
      shape: 'diamond'
    });

    var last = traverse(graph, [null].concat(node.block));
    graph.setEdge(node.guid, node.block[0].guid, { label: 'Sim'});
    graph.setEdge(last.guid, node.guid);
    return [node, last];
    
//    return node;
  },
  comment: function(graph, node) {}
};


function visit(graph, node, visitor) {
  if (!node) return;
  if (!visitor) visitor = grapher;
  return visitor[node.type].call(visitor, graph, node);
}

function grapher(tree) {}

function isPlainObject(o) {
  return !_.isArray(o) && _.isObject(o);
}
function traverse(g, tree) {
  return _.reduce(tree, function(from, to) {

    if(isPlainObject(from)) from = visit(g, from);
    if(isPlainObject(to)) to = visit(g, to);

    if(_.isArray(to) ) to = to[0];

    if (to)
      _.each([null].concat(from), (_from) => !!_from && g.setEdge(_from.guid, to.guid));

    return to;
  });

}

function render(tree) {
  var g = new dagreD3.graphlib.Graph()
    .setGraph({})
    .setDefaultEdgeLabel(function() {
      return {};
    });

  traverse(g, tree);
  console.log(g);

  renderer(d3.select("#chart svg g"), g);
}

$(_code).on('keypress', function(event) {
  if (typing_timeout)
    window.clearTimeout(typing_timeout);
  typing_timeout = window.setTimeout(parse_code, 800);
});
