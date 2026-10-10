// Shared geometry for the interactive scene and the static social card.
export function blueprint(key) {
  const blocks = [], links = [], labels = [];
  const block = (p, s, ink = false) => { blocks.push({ p, s, ink }); return blocks.length - 1; };
  const label = (name, p) => labels.push({ name, p });
  const link = (...points) => links.push(points);
  const team = (x, y, z, size = 1.7) => {
    block([x, y, z], [size, .1, size]);
    for (let i = 0; i < 4; i++) {
      block([x + (i % 2 ? .38 : -.38), y + .27 + (i === 0 ? .1 : 0), z + (i < 2 ? -.38 : .38)], [.42, i === 0 ? .5 : .3, .42], i === 0);
    }
  };
  if (key === 'task') {
    const names = ['Brief', 'Research', 'Summary'];
    names.forEach((name, i) => {
      const x = (i - 1) * 2.9, y = (i - 1) * .55;
      block([x, y, 0], [1.7, .5, 1.7], i === 1);
      block([x, y - .6, 0], [2.05, .05, 2.05]);
      label(name, [x, y + .8, 0]);
      if (i < 2) link([x + .85, y, 0], [x + 1.45, y, 0], [x + 1.45, y + .55, 0], [x + 2.05, y + .55, 0]);
    });
  } else if (key === 'role') {
    block([0, .75, 0], [1.45, .9, 1.45], true);
    label('Purpose', [0, 1.8, 0]);
    const outer = [[-2.1, -.25, -1.7], [2.1, -.25, -1.7], [2.1, -.25, 1.7], [-2.1, -.25, 1.7]];
    outer.forEach((p, i) => {
      block(p, [1.3, .3, 1.3]);
      label(['Context', 'Tools', 'Output', 'Review'][i], [p[0], p[1] + .65, p[2]]);
      link(p, [p[0], .75, p[2]], [0, .75, p[2]], [0, .75, 0]);
      link(p, outer[(i + 1) % 4]);
    });
    block([0, -.7, 0], [6.1, .04, 5.3]);
  } else if (key === 'department') {
    const centers = [[-2, .2, -1.65], [2, .2, -1.65], [2, .2, 1.65], [-2, .2, 1.65]];
    centers.forEach((p, i) => {
      team(...p);
      label(['Research', 'Planning', 'Execution', 'Review'][i], [p[0], 1.12, p[2]]);
      const next = centers[(i + 1) % 4];
      link([p[0], .3, p[2]], [next[0], .3, next[2]]);
    });
    block([0, -.6, 0], [6.4, .06, 5.5]);
  } else {
    // Exploded organization: direction above, operating teams, business work below.
    block([0, 2.65, 0], [1.8, .24, 1.3], true);
    label('Human direction', [0, 3.3, 0]);
    block([0, .55, 0], [5.6, .1, 4.1]);
    [[-1.45, -.98], [1.45, -.98], [-1.45, .98], [1.45, .98]].forEach(([x, z]) => {
      team(x, .7, z, 1.48);
      link([0, 2.5, 0], [x, 2.1, z], [x, 1.05, z]);
      link([x, .5, z], [x, -1.55, z]);
    });
    label('Agent departments', [-2.8, .9, 1.7]);
    block([0, -1.6, 0], [5.8, .2, 4.3], true);
    label('Business operations', [1.3, -1.7, 2.5]);
    block([-3.5, .2, -.6], [.42, 3.55, .42]);
    label('Accountability', [-3.5, 2.2, -.6]);
    link([0, 2.65, 0], [-3.5, 2.65, 0], [-3.5, 2.65, -.6], [-3.5, -1.6, -.6], [0, -1.6, -.6]);
  }
  return { blocks, links, labels };
}
