/* interact.js 1.10.26 | https://raw.github.com/taye/interact.js/main/LICENSE */

import is from"../../utils/is.prod.js";function install(t){const{actions:e,Interactable:o,defaults:r}=t;o.prototype.draggable=drag.draggable,e.map.drag=drag,e.methodDict.drag="draggable",r.actions.drag=drag.defaults}function beforeMove(t){let{interaction:e}=t;if("drag"!==e.prepared.name)return;const o=e.prepared.axis;"x"===o?(e.coords.cur.page.y=e.coords.start.page.y,e.coords.cur.client.y=e.coords.start.client.y,e.coords.velocity.client.y=0,e.coords.velocity.page.y=0):"y"===o&&(e.coords.cur.page.x=e.coords.start.page.x,e.coords.cur.client.x=e.coords.start.client.x,e.coords.velocity.client.x=0,e.coords.velocity.page.x=0)}function move(t){let{iEvent:e,interaction:o}=t;if("drag"!==o.prepared.name)return;const r=o.prepared.axis;if("x"===r||"y"===r){const t="x"===r?"y":"x";e.page[t]=o.coords.start.page[t],e.client[t]=o.coords.start.client[t],e.delta[t]=0}}const draggable=function(t){return is.object(t)?(this.options.drag.enabled=!1!==t.enabled,this.setPerAction("drag",t),this.setOnEvents("drag",t),/^(xy|x|y|start)$/.test(t.lockAxis)&&(this.options.drag.lockAxis=t.lockAxis),/^(xy|x|y)$/.test(t.startAxis)&&(this.options.drag.startAxis=t.startAxis),this):is.bool(t)?(this.options.drag.enabled=t,this):this.options.drag},drag={id:"actions/drag",install:install,listeners:{"interactions:before-action-move":beforeMove,"interactions:action-resume":beforeMove,"interactions:action-move":move,"auto-start:check"(t){const{interaction:e,interactable:o,buttons:r}=t,a=o.options.drag;if(a&&a.enabled&&(!e.pointerIsDown||!/mouse|pointer/.test(e.pointerType)||0!=(r&o.options.drag.mouseButtons)))return t.action={name:"drag",axis:"start"===a.lockAxis?a.startAxis:a.lockAxis},!1}},draggable:draggable,beforeMove:beforeMove,move:move,defaults:{startAxis:"xy",lockAxis:"xy"},getCursor:()=>"move",filterEventType(t){return 0===t.search("drag")}};export{drag as default};
//# sourceMappingURL=plugin.prod.js.map