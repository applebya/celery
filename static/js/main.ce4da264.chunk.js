(this.webpackJsonpcelery=this.webpackJsonpcelery||[]).push([[0],{64:function(e,a,t){e.exports=t(75)},75:function(e,a,t){"use strict";t.r(a);var r=t(0),n=t.n(r),l=t(9),c=t.n(l),o=t(29),i=t(36),m=t(112),s=t(113),u=t(77),d=t(110),y=t(114),p=t(109),f=t(120),b=t(119),g=t(124),v=t(116),h=t(111),E=t(123);function O(){return(O=Object.assign||function(e){for(var a=1;a<arguments.length;a++){var t=arguments[a];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}function j(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var S,x,w=n.a.createElement("g",null,n.a.createElement("g",null,n.a.createElement("path",{d:"M511.996,245.866l-65.059-39.121l8.529-22.822l-0.071-0.027c5.41-3.978,10.784-8.645,16.179-14.042l17.831-17.838 l-61.131-22.201l10.7-57.672l-57.637,10.718l-22.214-61.122l-17.831,17.817c-4.269,4.266-10.384,10.383-16.226,18.151 l-19.794,7.368L266.131,0l-22.346,54.127l-58.118-40.495l4.805,37.372c2.188,17.059,4.818,37.564,13.533,56.35L42.408,268.951 c-25.364,25.355-39.493,52.092-41.996,79.47c-3.281,35.896,13.207,72.247,48.96,107.997l6.16,6.176 c32.824,32.821,66.109,49.407,99.087,49.405c2.988-0.001,5.979-0.137,8.961-0.41c27.373-2.504,54.113-16.631,79.477-41.992 l161.594-161.592c18.855,8.758,39.436,11.369,56.557,13.541l37.12,4.718l-40.463-58.056L511.996,245.866z M32.395,351.344 c1.801-19.698,12.808-39.778,32.719-59.682L244.38,112.4l-7.041-10.897c-3.616-5.597-6.272-11.887-8.302-18.509l29.183,20.334 l13.262-32.124l20.013,33.27l16.595-6.177c-0.563,5.883-0.377,12.097,0.85,18.637c-31.588,31.555-168.455,168.281-192.748,192.582 c-28.354,28.346-52.132,72.703-47.215,121.021C42.421,402.95,30.113,376.323,32.395,351.344z M104.359,389.927 c8.357-29.268,26.938-50.101,34.542-57.703c27.356-27.362,197.513-197.342,199.228-199.055l7.051-7.043l-3.182-9.445 c-4.189-12.437-1.721-23.362,5.044-34.161l13.408,36.893l38.416-7.144l-7.133,38.441l35.818,13.008 c-10.452,5.542-22.819,8.119-36.741,2.839l-9.701-3.677l-7.34,7.332c-1.727,1.725-173.004,172.808-200.381,200.185 c-8.242,8.242-35.576,32.797-72.546,37.694C101.446,402.082,102.618,396.024,104.359,389.927z M429.013,282.979 c-6.614-2.029-12.901-4.687-18.494-8.306l-10.899-7.054l-179.271,179.27c-34.696,34.691-68.864,41.999-105.341,21.79 c-5.523-9.315-9.501-18.828-11.898-28.511c47.973-5.68,82.632-36.702,92.988-47.057c24.237-24.238,161.307-161.156,193.577-193.39 c8.361,1.938,16.745,2.383,25.102,1.338l-7.269,19.45l33.272,20.008l-32.121,13.259L429.013,282.979z"}))),R=function(e){var a=e.svgRef,t=e.title,r=j(e,["svgRef","title"]);return n.a.createElement("svg",O({id:"Layer_1",x:"0px",y:"0px",viewBox:"0 0 512 512",style:{enableBackground:"new 0 0 512 512"},xmlSpace:"preserve",ref:a},r),t?n.a.createElement("title",null,t):null,w)},k=n.a.forwardRef((function(e,a){return n.a.createElement(R,O({svgRef:a},e))})),N=(t.p,t(38)),C=t(35),P=t(76),M=t(118),A=t(53),I=t(16),L=t(24),$=t(37);!function(e){e.AddSalary="addSalary",e.RemoveSalary="removeSalary",e.SetHourlyRate="setHourlyRate",e.SetName="setName"}(S||(S={})),function(e){e.PerHour="/hour",e.PerDay="/day",e.PerMonth="/month",e.PerYear="/year"}(x||(x={}));var z=1,B=window.localStorage.getItem("persistedState")?JSON.parse(window.localStorage.getItem("persistedState")||"{}"):{salaries:Object(L.a)({},Object($.v4)(),{name:"Company".concat(z),hourlyRate:"",salary:0})},H=function(e,a){var t=a.type,r=a.payload;switch(t){case S.AddSalary:return z++,Object(I.a)({},e,{salaries:Object(I.a)({},e.salaries,Object(L.a)({},Object($.v4)(),{name:"Company".concat(z),hourlyRate:"",salary:0}))});case S.RemoveSalary:z++;var n=e.salaries,l=r.id,c=(n[l],Object(C.a)(n,[l].map(A.a)));return Object(I.a)({},e,{salaries:c});case S.SetHourlyRate:var o=r.data;return o.length&&Number.isNaN(Number(o))?e:Object(I.a)({},e,{salaries:Object(I.a)({},e.salaries,Object(L.a)({},r.id,Object(I.a)({},e.salaries[r.id],{hourlyRate:o,salary:T(Number(o))})))});case S.SetName:return Object(I.a)({},e,{salaries:Object(I.a)({},e.salaries,Object(L.a)({},r.id,Object(I.a)({},e.salaries[r.id],{name:r.data})))});default:return e}},J=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:B,a=arguments.length>1?arguments[1]:void 0,t=H(e,a);return localStorage.setItem("persistedState",JSON.stringify(t)),t},T=function(e){return e?8*e*261.25:0},D=function(){return Object(r.useReducer)(J,B)},F=n.a.memo((function(e){var a=e.id,t=e.name,r=e.hourlyRate,l=e.salary,c=void 0===l?0:l,o=e.dispatch,i=Object(C.a)(e,["id","name","hourlyRate","salary","dispatch"]);return n.a.createElement(P.a,i,n.a.createElement(M.a,{style:{padding:"1em"}},n.a.createElement(p.a,{container:!0,spacing:2},n.a.createElement(p.a,{item:!0,sm:4,xs:12},n.a.createElement(v.a,{name:"name",placeholder:"Untitled",color:"secondary",value:t,style:{marginBottom:15},inputProps:{style:{fontSize:"1.5em"}},onChange:function(e){o({type:S.SetName,payload:{id:a,data:e.target.value}})}}),n.a.createElement(v.a,{name:"hourlyRate",variant:"outlined",autoComplete:"off",value:r,onChange:function(e){o({type:S.SetHourlyRate,payload:{id:a,data:e.target.value}})},placeholder:"0.00",autoFocus:!0,InputProps:{startAdornment:n.a.createElement(h.a,{position:"start"},"$"),endAdornment:n.a.createElement(h.a,{position:"end"},"per hour")}})),n.a.createElement(p.a,{item:!0,style:{flex:1}}),n.a.createElement(p.a,{item:!0,sm:4,xs:12},"Salary:"," ",n.a.createElement("strong",null,"$",c.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,"))," ","/ year",n.a.createElement(M.a,null,n.a.createElement(b.a,{onClick:function(){return o({type:S.RemoveSalary,payload:{id:a}})}},"Remove"))))))}));function W(){var e=Object(i.a)(["\n    display: flex;\n    flex-direction: row;\n    justify-content: space-between;\n"]);return W=function(){return e},e}function K(){var e=Object(i.a)(["\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n"]);return K=function(){return e},e}var U=N.a.div(K()),Y=Object(N.a)(m.a)(W()),_=function(){var e=D(),a=Object(o.a)(e,2),t=a[0],l=a[1],c=Object(r.useState)(0),i=Object(o.a)(c,2),m=i[0],O=i[1],j=Object(r.useState)(75e3),x=Object(o.a)(j,2),w=x[0],R=x[1];return n.a.createElement(U,null,n.a.createElement(s.a,{position:"static"},n.a.createElement(Y,null,n.a.createElement("div",null),n.a.createElement("div",null,n.a.createElement(u.a,{variant:"h6",component:"h1",style:{fontWeight:"bold"}},"Celery",n.a.createElement(d.a,{viewBox:"0 0 512 512",style:{marginLeft:10,verticalAlign:"sub"}},n.a.createElement(k,null)))))),n.a.createElement(y.a,{style:{height:"calc(100vh - 64px)",maxHeight:"calc(100vh - 64px)",display:"flex",flexDirection:"column",padding:"3em 0 1em"}},n.a.createElement(p.a,{container:!0,direction:"column",spacing:2,style:{flex:1}},Object.entries(t.salaries).map((function(e){var a=Object(o.a)(e,2),t=a[0],r=a[1];return n.a.createElement(p.a,{item:!0,key:t},n.a.createElement(f.a,{in:!0},n.a.createElement(F,Object.assign({key:t,id:t,dispatch:l},r))))})),n.a.createElement(p.a,{item:!0},n.a.createElement(b.a,{size:"large",color:"primary",onClick:function(){return l({type:S.AddSalary})},endIcon:n.a.createElement(E.a,null)},"Add Salary"))),n.a.createElement(p.a,{item:!0},n.a.createElement(p.a,{container:!0,spacing:2,style:{marginTop:"3em"}},n.a.createElement(p.a,{item:!0},n.a.createElement(u.a,{variant:"h6",color:"textSecondary"},"Min")),n.a.createElement(p.a,{item:!0,style:{flex:1}},n.a.createElement(g.a,{color:"secondary",track:!1,min:m,max:w,value:Object.values(t.salaries).map((function(e){return e.salary})),valueLabelFormat:function(e){return e>=1e6?"".concat(Math.floor(e/1e6),"M"):e>=1e3?"".concat(Math.floor(e/1e3),"K"):"$".concat(e)},valueLabelDisplay:"on"})),n.a.createElement(p.a,{item:!0},n.a.createElement(u.a,{variant:"h6",color:"textSecondary"},"Max"))),n.a.createElement(p.a,{container:!0,justify:"space-between"},n.a.createElement(p.a,{item:!0},n.a.createElement(v.a,{name:"minSalary",onChange:function(e){O(Number(e.target.value))},value:m,placeholder:"0.00",InputProps:{startAdornment:n.a.createElement(h.a,{position:"start"},"$")}})),n.a.createElement(p.a,{item:!0},n.a.createElement(v.a,{name:"maxSalary",onChange:function(e){R(Number(e.target.value))},value:w,placeholder:"0.00",InputProps:{startAdornment:n.a.createElement(h.a,{position:"start"},"$")}}))))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var q=t(122),G=t(52),Q=t(121),V=t(115),X=Object(G.a)({palette:{common:{black:"rgba(0, 0, 0, 1)",white:"#fff"},background:{paper:"rgba(255, 255, 255, 1)",default:"rgba(239, 239, 239, 1)"},primary:{light:"rgba(175, 238, 107, 1)",main:"rgba(97, 186, 0, 1)",dark:"rgba(65, 117, 5, 1)",contrastText:"#fff"},secondary:{light:"rgba(175, 238, 107, 1)",main:"rgba(97, 186, 0, 1)",dark:"rgba(65, 117, 5, 1)",contrastText:"#fff"},error:{light:"#e57373",main:"#f44336",dark:"#d32f2f",contrastText:"#fff"},text:{primary:"rgba(59, 59, 59, 0.87)",secondary:"rgba(73, 73, 73, 0.6)",disabled:"rgba(0, 0, 0, 0.38)",hint:"rgba(0, 0, 0, 0.38)"}}});X=Object(Q.a)(X),c.a.render(n.a.createElement(V.a,{theme:X},n.a.createElement(q.a,null),n.a.createElement(_,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))}},[[64,1,2]]]);
//# sourceMappingURL=main.ce4da264.chunk.js.map