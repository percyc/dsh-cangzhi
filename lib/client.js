window.__ModuleLoader__.load({
	id: "dsh-cangzhi",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region bundled stylesheet Cangzhi.module.css.mjs
		const css = ".sRLa1a_footerButton{box-sizing:border-box;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-size:14px;line-height:22px;display:flex;position:relative;overflow:hidden}.sRLa1a_footerButton:hover,.sRLa1a_footerButton[data-active=true]{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_footerButtonRail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 0;padding:0}.sRLa1a_footerIcon{flex:none;justify-content:center;align-items:center;width:16px;height:16px;font-size:16px;line-height:16px;display:inline-flex}.sRLa1a_footerButtonRail .sRLa1a_footerIcon{width:18px;height:18px;font-size:18px;line-height:18px}.sRLa1a_footerLabel{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.sRLa1a_sidebarHealthDot{background:var(--dsw-alias-label-tertiary);width:8px;height:8px;box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-label-tertiary) 12%, transparent);border-radius:50%;flex:none}.sRLa1a_sidebarHealthDot[data-state=ok]{background:#1ca46f;box-shadow:0 0 0 2px #1ca46f24}.sRLa1a_sidebarHealthDot[data-state=warning]{background:#e5a21a;box-shadow:0 0 0 2px #e5a21a24}.sRLa1a_sidebarHealthDot[data-state=error]{background:var(--dsw-alias-label-error);box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-label-error) 14%, transparent)}.sRLa1a_footerButtonRail .sRLa1a_sidebarHealthDot{width:7px;height:7px;position:absolute;top:3px;right:3px}.sRLa1a_cangzhiMark{box-sizing:border-box;background:linear-gradient(145deg, var(--dsw-alias-brand-primary), #6b52d9);color:#fff;box-shadow:0 3px 10px color-mix(in srgb, var(--dsw-alias-brand-primary) 24%, transparent);border-radius:28%;flex:none;place-items:center;font-family:ui-serif,serif;font-weight:700;line-height:1;display:inline-grid}.sRLa1a_homeIntegration{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 3%, transparent);width:100%;box-shadow:none;border:0;border-radius:0;padding:10px 12px 12px}.sRLa1a_homeLoading{color:var(--dsw-alias-label-tertiary);text-align:center;font-size:12px}.sRLa1a_homeIntro,.sRLa1a_homeTop{align-items:center;gap:11px;display:flex}.sRLa1a_homeTop{justify-content:space-between}.sRLa1a_homeIntro>div{flex-direction:column;min-width:0;display:flex}.sRLa1a_homeIntro strong{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}.sRLa1a_homeIntro small{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:12px;line-height:18px}.sRLa1a_homeLogin{grid-template-columns:1fr 1fr auto;gap:8px;margin-top:12px;display:grid}.sRLa1a_homeLogin input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);min-width:0;height:34px;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px}.sRLa1a_homeLogin button,.sRLa1a_homeActions button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);height:36px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;padding:0 12px;font-size:13px}.sRLa1a_homeLogin button,.sRLa1a_homeActions .sRLa1a_homePrimary{background:var(--dsw-alias-brand-primary);color:#fff;border-color:#0000}.sRLa1a_homeLogin button:disabled,.sRLa1a_homeActions button:disabled{opacity:.5;cursor:default}.sRLa1a_homeNotice{color:var(--dsw-alias-label-secondary);margin:9px 0 0;font-size:12px;line-height:18px}.sRLa1a_homeConnection{color:#bd7910;background:#e5a21a1f;border-radius:99px;flex:none;padding:5px 9px;font-size:12px}.sRLa1a_homeConnection[data-ok=true]{color:#138258;background:#1ca46f1f}.sRLa1a_homeWorkspace{border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 78%, transparent);border-radius:9px;align-items:center;gap:10px;margin:10px 0;padding:8px 10px;display:flex}.sRLa1a_homeWorkspace>span{width:64px;color:var(--dsw-alias-label-secondary);flex:none;font-size:12px;font-weight:600}.sRLa1a_homeWorkspace>div{align-items:center;gap:6px;display:flex}.sRLa1a_homeWorkspace select{max-width:190px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:0;outline:0;font-size:13px;font-weight:650}.sRLa1a_homeWorkspace>small{min-width:0;color:var(--dsw-alias-label-tertiary);text-align:right;flex:1;font-size:11px;line-height:17px}.sRLa1a_homeActions{justify-content:flex-end;gap:7px;display:flex}.sRLa1a_knowledgeDock{width:calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px));max-width:var(--dsh-composer-card-max-width,952px);box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 17%, var(--dsw-alias-border-l2));background:linear-gradient(110deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-base)), var(--dsw-alias-bg-base) 72%);color:var(--dsw-alias-label-secondary);box-shadow:0 3px 14px color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent);border-radius:11px;flex:none;margin:0 auto 8px;overflow:hidden}.sRLa1a_knowledgeDockTop{align-items:center;gap:8px;min-height:42px;padding:0 9px;display:flex}.sRLa1a_knowledgeDockTitle{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_knowledgeDockTitle>span{align-items:center;gap:6px;display:flex}.sRLa1a_knowledgeDockTitle strong{color:var(--dsw-alias-label-primary);font-size:10px}.sRLa1a_knowledgeDockTitle i,.sRLa1a_conversationKnowledgeHeader>i{background:#e5a21a;border-radius:50%;width:6px;height:6px;box-shadow:0 0 0 2px #e5a21a26}.sRLa1a_knowledgeDockTitle i[data-ok=true],.sRLa1a_conversationKnowledgeHeader>i[data-ok=true]{background:#1ca46f;box-shadow:0 0 0 2px #1ca46f26}.sRLa1a_knowledgeDockTitle small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:8px;overflow:hidden}.sRLa1a_dockLibraryButton,.sRLa1a_dockToggle{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;flex:none;font-size:9px}.sRLa1a_dockLibraryButton:hover{color:var(--dsw-alias-brand-primary)}.sRLa1a_dockToggle{border-radius:7px;place-items:center;width:23px;height:23px;font-size:12px;display:grid}.sRLa1a_dockToggle:hover{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_knowledgePrompts{border-top:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, var(--dsw-alias-border-l2));align-items:center;gap:6px;min-width:0;padding:7px 9px 8px 40px;display:flex}.sRLa1a_knowledgePrompts>span{color:var(--dsw-alias-label-tertiary);flex:none;font-size:8px}.sRLa1a_knowledgePrompts button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;border-radius:99px;padding:4px 8px;font-size:8px;overflow:hidden}.sRLa1a_knowledgePrompts button:hover{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, var(--dsw-alias-border-l2));color:var(--dsw-alias-brand-primary)}.sRLa1a_knowledgePrompts button:disabled{opacity:.45;cursor:default}.sRLa1a_conversationKnowledgeHeader{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 4%, var(--dsw-alias-bg-base));border-radius:9px;align-items:center;gap:5px;height:28px;padding:0 7px;display:inline-flex}.sRLa1a_conversationKnowledgeHeader>span{color:var(--dsw-alias-label-tertiary);font-size:8px}.sRLa1a_conversationKnowledgeHeader select{max-width:130px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:0;outline:0;padding:0;font-size:9px;font-weight:600}.sRLa1a_conversationKnowledgeHeader>button{width:22px;height:22px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:6px;place-items:center;margin-left:2px;font-size:12px;display:grid}.sRLa1a_conversationKnowledgeHeader>button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-brand-primary)}.sRLa1a_conversationKnowledgeFallback{border:1px solid var(--dsw-alias-border-l2);height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border-radius:9px;align-items:center;gap:5px;padding:0 8px;font-size:9px;display:inline-flex}.sRLa1a_drawerLayer{z-index:95;backdrop-filter:blur(2px);background:#1010183d;justify-content:flex-end;display:flex;position:absolute;inset:0}.sRLa1a_knowledgeDrawer{border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);flex-direction:column;width:min(900px,100% - 48px);min-width:0;height:100%;display:flex;overflow:hidden;box-shadow:-16px 0 48px #1010182e}.sRLa1a_knowledgeDrawer>header{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;min-height:58px;padding:9px 12px 9px 16px;display:flex}.sRLa1a_knowledgeDrawer>header>div{align-items:center;gap:10px;min-width:0;display:flex}.sRLa1a_knowledgeDrawer>header span{flex-direction:column;min-width:0;display:flex}.sRLa1a_knowledgeDrawer>header strong{color:var(--dsw-alias-label-primary);font-size:13px}.sRLa1a_knowledgeDrawer>header small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:9px;overflow:hidden}.sRLa1a_knowledgeDrawer>header>button{border:1px solid var(--dsw-alias-border-l2);width:32px;height:32px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:9px;place-items:center;font-size:18px;display:grid}.sRLa1a_drawerToolbar{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);align-items:center;gap:7px;padding:11px 13px;display:flex}.sRLa1a_drawerToolbar form{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:9px;flex:1;align-items:center;height:36px;display:flex}.sRLa1a_drawerToolbar form>span{color:var(--dsw-alias-label-tertiary);padding-left:10px}.sRLa1a_drawerToolbar input{min-width:0;height:100%;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:0;outline:0;flex:1;padding:0 9px;font-size:10px}.sRLa1a_drawerToolbar button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);height:32px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:8px;flex:none;padding:0 10px;font-size:9px}.sRLa1a_drawerToolbar form button{background:var(--dsw-alias-brand-primary);color:#fff;border:0;height:28px;margin-right:3px}.sRLa1a_drawerToolbar button:disabled{opacity:.5;cursor:default}.sRLa1a_drawerNotice{border-bottom:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);margin:0;padding:7px 14px;font-size:9px}.sRLa1a_drawerBody{flex:1;min-height:0;display:flex}.sRLa1a_drawerResults{border-right:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);flex:none;width:330px;overflow-y:auto}.sRLa1a_drawerSectionTitle{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;min-height:39px;padding:0 12px;display:flex}.sRLa1a_drawerSectionTitle strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;overflow:hidden}.sRLa1a_drawerSectionTitle span{color:var(--dsw-alias-label-tertiary);font-size:8px}.sRLa1a_drawerResults>button{box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);width:100%;min-height:62px;color:inherit;text-align:left;cursor:pointer;background:0 0;align-items:flex-start;gap:9px;padding:10px 11px;display:flex}.sRLa1a_drawerResults>button:hover,.sRLa1a_drawerResults>button[data-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_drawerResults>button[data-selected=true]{box-shadow:inset 2px 0 var(--dsw-alias-brand-primary)}.sRLa1a_drawerFileIcon{background:var(--dsw-alias-bg-layer-3);width:28px;height:28px;color:var(--dsw-alias-brand-primary);border-radius:8px;flex:none;place-items:center;font-size:12px;display:grid}.sRLa1a_drawerResults>button>div{flex:1;min-width:0}.sRLa1a_drawerResults strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;display:block;overflow:hidden}.sRLa1a_drawerResults small{color:var(--dsw-alias-label-tertiary);margin-top:3px;font-size:8px;display:block}.sRLa1a_drawerResults p{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:5px 0 0;font-size:8px;line-height:12px;display:-webkit-box;overflow:hidden}.sRLa1a_drawerPreview{background:color-mix(in srgb, var(--dsw-alias-bg-layer-2) 65%, var(--dsw-alias-bg-base));flex-direction:column;flex:1;min-width:0;min-height:0;display:flex}.sRLa1a_drawerPreview .sRLa1a_drawerSectionTitle{background:var(--dsw-alias-bg-base)}.sRLa1a_drawerPreview .sRLa1a_drawerSectionTitle button{background:var(--dsw-alias-brand-primary);color:#fff;font:inherit;cursor:pointer;border:0;border-radius:7px;flex:none;padding:6px 9px;font-size:8px}.sRLa1a_drawerPreview object{background:#fff;border:0;flex:1;width:100%;min-height:0}.sRLa1a_previewPlaceholder,.sRLa1a_drawerEmpty{min-height:180px;color:var(--dsw-alias-label-tertiary);flex-direction:column;flex:1;justify-content:center;align-items:center;display:flex}.sRLa1a_previewPlaceholder span{opacity:.55;font-size:31px}.sRLa1a_previewPlaceholder p{margin:10px 0 0;font-size:10px}.sRLa1a_drawerEmpty{text-align:center;padding:20px;font-size:10px}.sRLa1a_drawerLogin{text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;padding:30px;display:flex}.sRLa1a_drawerLogin h3{color:var(--dsw-alias-label-primary);margin:14px 0 5px;font-size:16px}.sRLa1a_drawerLogin p{max-width:390px;color:var(--dsw-alias-label-tertiary);margin:0;font-size:10px;line-height:16px}.sRLa1a_drawerLogin button{background:var(--dsw-alias-brand-primary);color:#fff;cursor:pointer;border:0;border-radius:8px;margin-top:16px;padding:8px 13px}[data-cangzhi-workbench=true]{box-sizing:border-box;padding-right:min(var(--cangzhi-workbench-width,480px), calc(100vw - 320px));transition:padding-right var(--ds-transition-duration-slow) var(--ds-ease-in-out)}.sRLa1a_knowledgeWorkbench{z-index:30;border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);flex-direction:column;min-width:360px;max-width:min(760px,100vw - 320px);display:flex;position:absolute;top:0;bottom:0;right:0;overflow:hidden;box-shadow:-5px 0 18px #10101814}.sRLa1a_workbenchResize{z-index:2;cursor:col-resize;touch-action:none;width:8px;position:absolute;top:0;bottom:0;left:-4px}.sRLa1a_workbenchResize:after{background:var(--dsw-alias-border-l3);content:\"\";opacity:0;border-radius:4px;width:3px;height:38px;transition:opacity .15s;position:absolute;top:50%;left:2px;transform:translateY(-50%)}.sRLa1a_workbenchResize:hover:after{opacity:1}.sRLa1a_workbenchHeader{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);flex:none;justify-content:space-between;align-items:center;min-height:54px;padding:8px 9px 8px 14px;display:flex}.sRLa1a_workbenchHeader>div{align-items:center;gap:9px;min-width:0;display:flex}.sRLa1a_workbenchHeader>div>span{flex-direction:column;min-width:0;display:flex}.sRLa1a_workbenchHeader strong{color:var(--dsw-alias-label-primary);font-size:12px}.sRLa1a_workbenchHeader small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-top:2px;font-size:8px;overflow:hidden}.sRLa1a_workbenchHeader button{width:29px;height:29px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;place-items:center;font-size:15px;display:grid}.sRLa1a_workbenchHeader button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.sRLa1a_workbenchTabs{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);flex:none;height:36px;display:flex}.sRLa1a_workbenchTabs button{min-width:0;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;flex:1;font-size:9px;position:relative}.sRLa1a_workbenchTabs button:hover{color:var(--dsw-alias-label-primary)}.sRLa1a_workbenchTabs button[data-active=true]{color:var(--dsw-alias-label-primary);font-weight:600}.sRLa1a_workbenchTabs button[data-active=true]:after{background:var(--dsw-alias-brand-primary);content:\"\";border-radius:2px;height:2px;position:absolute;bottom:-1px;left:12px;right:12px}.sRLa1a_workbenchPane,.sRLa1a_workbenchPreview,.sRLa1a_contextPane{flex-direction:column;flex:1;min-height:0;display:flex;overflow:hidden}.sRLa1a_workbenchResults{flex:1;min-height:0;overflow-y:auto}.sRLa1a_workbenchResults>button{box-sizing:border-box;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);width:100%;min-height:66px;color:inherit;text-align:left;cursor:pointer;background:0 0;align-items:flex-start;gap:9px;padding:10px 12px;display:flex}.sRLa1a_workbenchResults>button:hover,.sRLa1a_workbenchResults>button[data-selected=true]{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_workbenchResults>button[data-selected=true]{box-shadow:inset 2px 0 var(--dsw-alias-brand-primary)}.sRLa1a_workbenchResults>button>div{flex:1;min-width:0}.sRLa1a_workbenchResults strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:10px;display:block;overflow:hidden}.sRLa1a_workbenchResults small{color:var(--dsw-alias-label-tertiary);margin-top:3px;font-size:8px;display:block}.sRLa1a_workbenchResults p{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:5px 0 0;font-size:8px;line-height:13px;display:-webkit-box;overflow:hidden}.sRLa1a_previewToolbar{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;align-items:center;gap:8px;min-height:42px;padding:6px 9px;display:flex}.sRLa1a_previewToolbar strong{min-width:0;color:var(--dsw-alias-label-primary);text-align:center;text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:9px;overflow:hidden}.sRLa1a_previewToolbar button{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:7px;flex:none;padding:6px 8px;font-size:8px}.sRLa1a_previewToolbar button:hover{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_previewToolbar button[data-primary=true]{background:var(--dsw-alias-brand-primary);color:#fff}.sRLa1a_workbenchPreview object{background:#fff;border:0;flex:1;width:100%;min-height:0}.sRLa1a_contextPane{padding:13px;overflow-y:auto}.sRLa1a_contextHero{border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, transparent);border-radius:10px;align-items:center;gap:10px;padding:11px;display:flex}.sRLa1a_contextHero>div{flex-direction:column;min-width:0;display:flex}.sRLa1a_contextHero strong{color:var(--dsw-alias-label-primary);font-size:11px}.sRLa1a_contextHero small{color:var(--dsw-alias-label-tertiary);margin-top:3px;font-size:8px;line-height:13px}.sRLa1a_contextEmpty{border:1px dashed var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);text-align:center;border-radius:9px;margin-top:12px;padding:18px 12px;font-size:9px;line-height:15px}.sRLa1a_contextList{border:1px solid var(--dsw-alias-border-l2);border-radius:9px;margin-top:10px;overflow:hidden}.sRLa1a_contextList article{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;min-height:48px;padding:0 9px;display:flex}.sRLa1a_contextList article:last-child{border-bottom:0}.sRLa1a_contextList article>span{color:var(--dsw-alias-brand-primary)}.sRLa1a_contextList article>div{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_contextList strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:9px;overflow:hidden}.sRLa1a_contextList small{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:7px}.sRLa1a_contextList button{color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;font-size:8px}.sRLa1a_contextTips{flex-wrap:wrap;gap:6px;margin-top:16px;display:flex}.sRLa1a_contextTips strong{color:var(--dsw-alias-label-secondary);flex-basis:100%;font-size:9px}.sRLa1a_contextTips button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:99px;padding:5px 8px;font-size:8px}.sRLa1a_workbenchNotice{border-top:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);flex:none;margin:0;padding:7px 10px;font-size:8px}.sRLa1a_workbenchStatus{box-sizing:border-box;border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);flex:none;align-items:center;gap:6px;min-height:27px;padding:0 10px;display:flex}.sRLa1a_workbenchStatus>span{background:#e5a21a;border-radius:50%;width:6px;height:6px}.sRLa1a_workbenchStatus>span[data-ok=true]{background:#1ca46f}.sRLa1a_workbenchStatus strong{color:var(--dsw-alias-label-secondary);font-size:8px}.sRLa1a_workbenchStatus small{color:var(--dsw-alias-label-tertiary);margin-left:auto;font-size:7px}.sRLa1a_overlay{z-index:100;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);min-width:0;min-height:0;box-shadow:var(--dsw-shadow-lv3);border-radius:14px;flex-direction:column;display:flex;position:absolute;inset:10px;overflow:hidden}.sRLa1a_consoleHeader{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);flex:none;align-items:center;gap:10px;min-height:52px;padding:8px 10px 8px 14px;display:flex}.sRLa1a_consoleTitle{color:var(--dsw-alias-label-primary);flex:none;font-size:14px;font-weight:600}.sRLa1a_nativeBadge{min-width:0;color:var(--dsw-alias-label-tertiary);flex:1;font-size:12px}.sRLa1a_toolbarButton,.sRLa1a_closeButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);height:34px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;flex:none;padding:0 11px;font-size:12px}.sRLa1a_toolbarButton:hover,.sRLa1a_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.sRLa1a_closeButton{width:34px;padding:0;font-size:18px}.sRLa1a_workspace{background:var(--dsw-alias-bg-layer-2);flex:1;min-height:0;display:flex}.sRLa1a_workspaceNav{box-sizing:border-box;border-right:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);flex-direction:column;flex:none;width:224px;padding:18px 12px;display:flex}.sRLa1a_brand{align-items:center;gap:10px;padding:0 10px 16px;display:flex}.sRLa1a_brand>span{background:var(--dsw-alias-brand-primary);color:#fff;border-radius:10px;place-items:center;width:34px;height:34px;font-size:19px;display:grid}.sRLa1a_brand div{flex-direction:column;min-width:0;display:flex}.sRLa1a_brand strong{color:var(--dsw-alias-label-primary);font-size:16px}.sRLa1a_brand small{color:var(--dsw-alias-label-tertiary);font-size:10px}.sRLa1a_workspaceSelector{border:1px solid var(--dsw-alias-border-l2);background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, var(--dsw-alias-bg-base)), var(--dsw-alias-bg-base));border-radius:11px;flex-direction:column;gap:5px;margin:0 2px 13px;padding:10px;display:flex}.sRLa1a_workspaceSelector>span{color:var(--dsw-alias-label-tertiary);letter-spacing:.05em;font-size:9px;font-weight:600}.sRLa1a_workspaceSelector select{width:100%;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;background:0 0;border:0;outline:0;padding:0;font-size:12px;font-weight:650}.sRLa1a_workspaceSelector small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:8px;line-height:13px;overflow:hidden}.sRLa1a_navSection{color:var(--dsw-alias-label-tertiary);letter-spacing:.09em;margin:7px 10px 5px;font-size:8px;font-weight:600}.sRLa1a_workspaceNav>button{height:37px;color:var(--dsw-alias-label-secondary);text-align:left;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:9px;align-items:center;gap:10px;margin-bottom:3px;padding:0 11px;font-size:11px;display:flex}.sRLa1a_workspaceNav>button>span{width:17px;color:var(--dsw-alias-label-tertiary);place-items:center;font-size:14px;font-weight:400;display:inline-grid}.sRLa1a_workspaceNav>button:hover,.sRLa1a_workspaceNav>button[data-active=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}.sRLa1a_workspaceNav>button[data-active=true]>span{color:var(--dsw-alias-brand-primary)}.sRLa1a_connectionCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;align-items:center;gap:9px;margin-top:auto;padding:11px;display:flex}.sRLa1a_connectionCard>span{background:#e5a21a;border-radius:50%;width:8px;height:8px;box-shadow:0 0 0 3px #e5a21a2e}.sRLa1a_connectionCard>span[data-ok=true]{background:#1ca46f;box-shadow:0 0 0 3px #1ca46f2e}.sRLa1a_connectionCard div{flex-direction:column;min-width:0;display:flex}.sRLa1a_connectionCard strong{color:var(--dsw-alias-label-primary);font-size:11px}.sRLa1a_connectionCard small{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:9px}.sRLa1a_workspaceMain{box-sizing:border-box;flex:1;min-width:0;padding:28px clamp(20px,3vw,42px) 44px;overflow:auto}.sRLa1a_pageHeader{justify-content:space-between;align-items:center;margin-bottom:22px;display:flex}.sRLa1a_pageEyebrow{color:var(--dsw-alias-brand-primary);letter-spacing:.06em;margin-bottom:3px;font-size:9px;font-weight:650;display:block}.sRLa1a_pageHeader h2{color:var(--dsw-alias-label-primary);letter-spacing:-.02em;margin:0;font-size:23px;line-height:29px}.sRLa1a_pageHeader p{max-width:660px;color:var(--dsw-alias-label-tertiary);margin:4px 0 0;font-size:11px;line-height:17px}.sRLa1a_headerActions{gap:7px;display:flex}.sRLa1a_refreshButton,.sRLa1a_rowActions button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:8px;padding:7px 10px}.sRLa1a_stats{grid-template-columns:repeat(4,minmax(0,1fr));gap:13px;margin-bottom:16px;display:grid}.sRLa1a_stats article{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;flex-direction:column;min-height:115px;padding:16px;display:flex}.sRLa1a_stats small{color:var(--dsw-alias-label-tertiary);font-size:11px}.sRLa1a_stats strong{color:var(--dsw-alias-label-primary);margin-top:10px;font-size:28px;line-height:32px}.sRLa1a_stats span{color:var(--dsw-alias-label-secondary);margin-top:auto;font-size:10px}.sRLa1a_systemStatus{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;align-items:center;gap:18px;margin-bottom:14px;padding:11px 13px;display:flex}.sRLa1a_systemStatusTitle{align-items:center;gap:9px;min-width:132px;display:flex}.sRLa1a_systemStatusTitle>span{background:#1ca46f;border-radius:50%;width:8px;height:8px;box-shadow:0 0 0 3px #1ca46f24}.sRLa1a_systemStatus[data-state=degraded] .sRLa1a_systemStatusTitle>span{background:#e5a21a;box-shadow:0 0 0 3px #e5a21a24}.sRLa1a_systemStatusTitle>div{flex-direction:column;display:flex}.sRLa1a_systemStatusTitle strong{color:var(--dsw-alias-label-primary);font-size:13px}.sRLa1a_systemStatusTitle small{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:12px}.sRLa1a_systemStatus dl{flex:1;align-items:center;gap:0;margin:0;display:flex}.sRLa1a_systemStatus dl>div{border-left:1px solid var(--dsw-alias-border-l2);min-width:100px;padding:0 14px}.sRLa1a_systemStatus dt{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.sRLa1a_systemStatus dd{color:var(--dsw-alias-label-primary);white-space:nowrap;margin:2px 0 0;font-size:13px;font-weight:600;line-height:20px}.sRLa1a_systemStatus [data-warning=true] dd{color:var(--dsw-alias-label-error)}.sRLa1a_quickActions{grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-bottom:16px;display:grid}.sRLa1a_quickActions button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);min-width:0;min-height:72px;color:inherit;text-align:left;cursor:pointer;border-radius:12px;align-items:center;gap:11px;padding:12px;transition:border-color .15s,transform .15s,box-shadow .15s;display:flex}.sRLa1a_quickActions button:hover{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 38%, var(--dsw-alias-border-l2));box-shadow:var(--dsw-shadow-lv1);transform:translateY(-1px)}.sRLa1a_quickActions button>span{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);width:34px;height:34px;color:var(--dsw-alias-brand-primary);border-radius:9px;flex:none;place-items:center;font-size:16px;display:grid}.sRLa1a_quickActions button>div{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_quickActions strong{color:var(--dsw-alias-label-primary);font-size:11px}.sRLa1a_quickActions small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-top:4px;font-size:8px;overflow:hidden}.sRLa1a_quickActions b{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400}.sRLa1a_panel,.sRLa1a_uploadPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;overflow:hidden}.sRLa1a_panelTitle{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;padding:15px 17px;display:flex}.sRLa1a_panelTitle h3{color:var(--dsw-alias-label-primary);margin:0;font-size:14px}.sRLa1a_panelTitle p{color:var(--dsw-alias-label-tertiary);margin:3px 0 0;font-size:10px}.sRLa1a_panelTitle button,.sRLa1a_primaryButton,.sRLa1a_categoryForm button{background:var(--dsw-alias-brand-primary);color:#fff;cursor:pointer;border:0;border-radius:8px;padding:8px 12px}.sRLa1a_documentRow{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:11px;min-height:55px;padding:0 16px;display:flex}.sRLa1a_documentRow:last-child{border-bottom:0}.sRLa1a_fileIcon{background:var(--dsw-alias-bg-layer-3);width:30px;height:30px;color:var(--dsw-alias-label-secondary);border-radius:7px;flex:none;place-items:center;display:grid}.sRLa1a_documentName{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_documentName strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;overflow:hidden}.sRLa1a_documentName small{color:var(--dsw-alias-label-tertiary);margin-top:3px;font-size:9px}.sRLa1a_status{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);border-radius:99px;flex:none;padding:4px 7px;font-size:9px}.sRLa1a_status[data-status=completed],.sRLa1a_status[data-status=ready]{color:#1ca46f;background:#1ca46f24}.sRLa1a_status[data-status=processing]{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);color:var(--dsw-alias-brand-primary)}.sRLa1a_status[data-status=failed]{color:var(--dsw-alias-label-error)}.sRLa1a_rowActions{gap:5px;display:flex}.sRLa1a_rowActions button{padding:5px 7px;font-size:9px}.sRLa1a_rowActions select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);max-width:100px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:7px;padding:4px 6px;font-size:9px}.sRLa1a_libraryToolbar{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:10px;padding:13px 16px;display:flex}.sRLa1a_libraryToolbar input,.sRLa1a_categoryForm input,.sRLa1a_loginForm input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:36px;color:var(--dsw-alias-label-primary);border-radius:8px;flex:1;padding:0 11px}.sRLa1a_libraryToolbar select,.sRLa1a_libraryToolbar button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:36px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;border-radius:8px;flex:none;padding:0 9px;font-size:9px}.sRLa1a_libraryToolbar button{background:0 0}.sRLa1a_libraryToolbar span{color:var(--dsw-alias-label-tertiary);font-size:10px}.sRLa1a_searchForm{border-bottom:1px solid var(--dsw-alias-border-l2);gap:8px;padding:14px;display:flex}.sRLa1a_searchForm input,.sRLa1a_createPanel input,.sRLa1a_createPanel textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;flex:1;padding:0 11px}.sRLa1a_searchForm input,.sRLa1a_createPanel input{height:37px}.sRLa1a_searchForm button{background:var(--dsw-alias-brand-primary);color:#fff;cursor:pointer;border:0;border-radius:8px;padding:0 15px}.sRLa1a_searchMeta{color:var(--dsw-alias-label-tertiary);margin:0;padding:10px 15px;font-size:10px}.sRLa1a_searchResults article{border-top:1px solid var(--dsw-alias-border-l2);padding:13px 16px}.sRLa1a_searchResults article>div{flex-direction:column;display:flex}.sRLa1a_searchResults strong{color:var(--dsw-alias-label-primary);font-size:12px}.sRLa1a_searchResults small{color:var(--dsw-alias-label-tertiary);margin-top:3px;font-size:9px}.sRLa1a_searchResults p{color:var(--dsw-alias-label-secondary);white-space:pre-wrap;margin:8px 0 0;font-size:10px;line-height:16px}.sRLa1a_createPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;padding:18px}.sRLa1a_modeTabs{gap:4px;margin-bottom:14px;display:flex}.sRLa1a_modeTabs button{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:8px;padding:7px 12px}.sRLa1a_modeTabs button[data-active=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}.sRLa1a_createPanel form{flex-direction:column;gap:10px;display:flex}.sRLa1a_createPanel textarea{resize:vertical;min-height:230px;padding-top:10px}.sRLa1a_createPanel .sRLa1a_primaryButton{align-self:flex-start}.sRLa1a_uploadPanel{padding:20px}.sRLa1a_dropZone{border:1px dashed var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:100%;min-height:210px;color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:11px;flex-direction:column;justify-content:center;align-items:center;display:flex}.sRLa1a_dropZone[data-dragging=true]{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-layer-2))}.sRLa1a_dropZone>span{font-size:27px}.sRLa1a_dropZone strong{margin-top:10px;font-size:14px}.sRLa1a_dropZone small{color:var(--dsw-alias-label-tertiary);margin-top:6px}.sRLa1a_uploadList{max-height:180px;margin:13px 0;overflow:auto}.sRLa1a_uploadList>div{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;min-height:35px;font-size:11px;display:flex}.sRLa1a_uploadList strong{color:var(--dsw-alias-label-primary);flex:1}.sRLa1a_uploadList small,.sRLa1a_progressText{color:var(--dsw-alias-label-tertiary);font-size:10px}.sRLa1a_uploadList button{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:0;font-size:15px}.sRLa1a_primaryButton{margin-top:12px}.sRLa1a_primaryButton:disabled{opacity:.45;cursor:default}.sRLa1a_categoryForm{gap:8px;margin-bottom:15px;display:flex}.sRLa1a_categoryGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;display:grid}.sRLa1a_categoryGrid article{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:10px;align-items:center;gap:10px;min-height:65px;padding:0 13px;display:flex}.sRLa1a_categoryGrid article>div{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_categoryGrid strong{color:var(--dsw-alias-label-primary);font-size:12px}.sRLa1a_categoryGrid small{color:var(--dsw-alias-label-tertiary);font-size:9px}.sRLa1a_categoryGrid button{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;font-size:9px}.sRLa1a_spacesLayout{gap:14px;display:grid}.sRLa1a_spaceIntro{border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 18%, var(--dsw-alias-border-l2));background:linear-gradient(135deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-base)), var(--dsw-alias-bg-base) 68%);border-radius:14px;grid-template-columns:minmax(0,1.5fr) minmax(250px,.8fr);gap:20px;padding:18px;display:grid}.sRLa1a_spaceIntro>div{align-items:center;gap:14px;display:flex}.sRLa1a_spaceIntro>div>span{background:var(--dsw-alias-brand-primary);color:#fff;width:46px;height:46px;box-shadow:0 7px 18px color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent);border-radius:13px;flex:none;place-items:center;font-size:20px;display:grid}.sRLa1a_spaceIntro h3,.sRLa1a_spaceCreate h3{color:var(--dsw-alias-label-primary);margin:0;font-size:15px}.sRLa1a_spaceIntro p,.sRLa1a_spaceCreate>div>p{color:var(--dsw-alias-label-secondary);margin:5px 0 0;font-size:10px;line-height:16px}.sRLa1a_spaceIntro ul{color:var(--dsw-alias-label-secondary);margin:0;padding:0 0 0 17px;font-size:9px;line-height:19px}.sRLa1a_spacePanel,.sRLa1a_spaceCreate{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;overflow:hidden}.sRLa1a_spaceGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:14px;display:grid}.sRLa1a_spaceGrid article{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:11px;align-items:center;gap:11px;min-width:0;min-height:82px;padding:12px;display:flex}.sRLa1a_spaceGrid article[data-current=true]{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l2));background:color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-base))}.sRLa1a_spaceGrid article[data-archived=true]{opacity:.65}.sRLa1a_spaceIcon{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 11%, transparent);width:38px;height:38px;color:var(--dsw-alias-brand-primary);border-radius:11px;flex:none;place-items:center;font-family:ui-serif,serif;font-size:16px;font-weight:700;display:grid}.sRLa1a_spaceBody{flex:1;min-width:0}.sRLa1a_spaceBody>div{align-items:center;gap:5px;display:flex}.sRLa1a_spaceBody strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.sRLa1a_spaceBody span{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);color:var(--dsw-alias-brand-primary);border-radius:99px;flex:none;padding:2px 5px;font-size:7px}.sRLa1a_spaceBody p{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;margin:4px 0 2px;font-size:9px;overflow:hidden}.sRLa1a_spaceBody small{color:var(--dsw-alias-label-tertiary);font-size:8px}.sRLa1a_spaceActions{flex-direction:column;align-items:flex-end;gap:4px;display:flex}.sRLa1a_spaceActions button{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;font-size:8px}.sRLa1a_spaceActions button:first-child{color:var(--dsw-alias-brand-primary)}.sRLa1a_spaceCreate{flex-direction:column;gap:12px;padding:18px;display:flex}.sRLa1a_spaceFields{grid-template-columns:1fr 1fr;gap:10px;display:grid}.sRLa1a_spaceCreate label{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:5px;font-size:9px;display:flex}.sRLa1a_spaceCreate input,.sRLa1a_spaceCreate textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);width:100%;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:0;padding:0 10px;font-size:10px}.sRLa1a_spaceCreate input{height:36px}.sRLa1a_spaceCreate textarea{resize:vertical;min-height:66px;padding-top:9px}.sRLa1a_spaceCreate input:focus,.sRLa1a_spaceCreate textarea:focus{border-color:color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, var(--dsw-alias-border-l2))}.sRLa1a_spaceCreate .sRLa1a_primaryButton{align-self:flex-start;margin-top:0}.sRLa1a_connectPanel{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;padding:22px}.sRLa1a_connectHero{background:var(--dsw-alias-bg-layer-2);border-radius:11px;align-items:center;gap:14px;padding:18px;display:flex}.sRLa1a_connectHero>span{color:#fff;background:#e5a21a;border-radius:13px;flex:none;place-items:center;width:44px;height:44px;font-size:21px;display:grid}.sRLa1a_connectHero>span[data-ok=true]{background:#1ca46f}.sRLa1a_connectHero h3{color:var(--dsw-alias-label-primary);margin:0;font-size:16px}.sRLa1a_connectHero p{max-width:650px;color:var(--dsw-alias-label-secondary);margin:5px 0 0;font-size:11px;line-height:17px}.sRLa1a_capabilityGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0;display:grid}.sRLa1a_capabilityGrid article{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;flex-direction:column;min-height:70px;padding:13px;display:flex}.sRLa1a_capabilityGrid strong{color:var(--dsw-alias-label-primary);font-size:11px}.sRLa1a_capabilityGrid small{color:var(--dsw-alias-label-tertiary);margin-top:5px;font-size:9px;line-height:14px}.sRLa1a_securityNote{color:var(--dsw-alias-label-tertiary);margin:16px 0 0;font-size:9px;line-height:15px}.sRLa1a_secondaryButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;margin-top:12px;padding:8px 12px}.sRLa1a_tokenList{border-top:1px solid var(--dsw-alias-border-l2);margin-top:18px;padding-top:14px}.sRLa1a_tokenList h4{color:var(--dsw-alias-label-primary);margin:0 0 8px;font-size:12px}.sRLa1a_tokenList>p{color:var(--dsw-alias-label-tertiary);font-size:10px}.sRLa1a_tokenList>div{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:9px;min-height:48px;display:flex}.sRLa1a_tokenList>div>div{flex-direction:column;flex:1;min-width:0;display:flex}.sRLa1a_tokenList strong{color:var(--dsw-alias-label-primary);font-size:10px}.sRLa1a_tokenList small{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin-top:3px;font-size:8px;overflow:hidden}.sRLa1a_tokenList span{color:#138258;background:#1ca46f1f;border-radius:99px;padding:3px 6px;font-size:8px}.sRLa1a_tokenList span[data-revoked=true]{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary)}.sRLa1a_tokenList button{color:var(--dsw-alias-label-error);cursor:pointer;background:0 0;border:0;font-size:9px}.sRLa1a_empty,.sRLa1a_centerState{min-height:160px;color:var(--dsw-alias-label-tertiary);place-items:center;font-size:12px;display:grid}.sRLa1a_errorBanner{background:color-mix(in srgb, var(--dsw-alias-label-error) 10%, transparent);color:var(--dsw-alias-label-error);border-radius:8px;margin:10px 0;padding:9px 11px;font-size:11px}.sRLa1a_loginPanel{background:var(--dsw-alias-bg-layer-2);flex-direction:column;flex:1;justify-content:center;align-items:center;min-height:0;display:flex}.sRLa1a_loginMark{background:var(--dsw-alias-brand-primary);color:#fff;border-radius:14px;place-items:center;width:48px;height:48px;font-size:24px;display:grid}.sRLa1a_loginPanel h2{color:var(--dsw-alias-label-primary);margin:14px 0 4px}.sRLa1a_loginPanel>p{color:var(--dsw-alias-label-tertiary);margin:0;font-size:11px}.sRLa1a_loginForm{flex-direction:column;gap:9px;width:280px;margin-top:18px;display:flex}.sRLa1a_loginForm input{flex:none}.sRLa1a_loginForm>button{background:var(--dsw-alias-brand-primary);color:#fff;cursor:pointer;border:0;border-radius:8px;height:37px}.sRLa1a_knowledgeDock.sRLa1a_knowledgeDock :where(strong,button){font-size:13px;line-height:20px}.sRLa1a_knowledgeDock.sRLa1a_knowledgeDock :where(small,span),.sRLa1a_conversationKnowledgeHeader.sRLa1a_conversationKnowledgeHeader :where(span,select,button),.sRLa1a_conversationKnowledgeFallback.sRLa1a_conversationKnowledgeFallback{font-size:12px;line-height:18px}.sRLa1a_knowledgeWorkbench.sRLa1a_knowledgeWorkbench :where(strong,button,input,select,textarea,label,p){font-size:13px;line-height:20px}.sRLa1a_knowledgeWorkbench.sRLa1a_knowledgeWorkbench :where(small),.sRLa1a_knowledgeWorkbench.sRLa1a_knowledgeWorkbench :where(.sRLa1a_workbenchNotice,.sRLa1a_workbenchStatus,.sRLa1a_contextEmpty){font-size:12px;line-height:18px}.sRLa1a_workspace.sRLa1a_workspace :where(strong,button,input,select,textarea,label,p){font-size:13px;line-height:20px}.sRLa1a_workspace.sRLa1a_workspace :where(small),.sRLa1a_workspace.sRLa1a_workspace :where(.sRLa1a_navSection,.sRLa1a_pageEyebrow,.sRLa1a_status,.sRLa1a_searchMeta,.sRLa1a_progressText,.sRLa1a_errorBanner){font-size:12px;line-height:18px}.sRLa1a_toolCard.sRLa1a_toolCard :where(small,span),.sRLa1a_evidencePreview.sRLa1a_evidencePreview :where(strong,p,button,span,small),.sRLa1a_answerPreview.sRLa1a_answerPreview :where(p,button,span,b){font-size:12px;line-height:18px}@media (width<=820px){.sRLa1a_workspaceNav{width:150px}.sRLa1a_stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sRLa1a_quickActions,.sRLa1a_spaceGrid,.sRLa1a_spaceIntro,.sRLa1a_categoryGrid,.sRLa1a_capabilityGrid{grid-template-columns:1fr}.sRLa1a_workspaceMain{padding:20px 16px}.sRLa1a_systemStatus{flex-direction:column;align-items:stretch;gap:10px}.sRLa1a_systemStatus dl{flex-wrap:wrap;row-gap:10px}.sRLa1a_systemStatus dl>div{flex:120px}}@media (width<=620px){.sRLa1a_workspace{flex-direction:column}.sRLa1a_workspaceNav{border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2);width:100%;max-height:210px;overflow:auto}.sRLa1a_brand,.sRLa1a_navSection,.sRLa1a_connectionCard{display:none}.sRLa1a_workspaceSelector{margin-bottom:8px}.sRLa1a_workspaceNav>button{width:auto;margin-right:3px;display:inline-flex}.sRLa1a_pageHeader{align-items:flex-start;gap:12px}.sRLa1a_spaceFields{grid-template-columns:1fr}.sRLa1a_knowledgePrompts{padding-left:9px;overflow-x:auto}.sRLa1a_knowledgeDrawer{width:100%}.sRLa1a_drawerBody{flex-direction:column}.sRLa1a_drawerResults{border-right:0;border-bottom:1px solid var(--dsw-alias-border-l2);width:100%;max-height:42%}.sRLa1a_drawerToolbar{flex-wrap:wrap}.sRLa1a_drawerToolbar form{flex-basis:100%}.sRLa1a_homeWorkspace{flex-wrap:wrap;align-items:flex-start}.sRLa1a_homeWorkspace>small{text-align:left;flex-basis:100%}.sRLa1a_homeLogin{grid-template-columns:1fr}.sRLa1a_homeActions{flex-wrap:wrap;justify-content:flex-start}.sRLa1a_homeConnection,.sRLa1a_conversationKnowledgeHeader>span{display:none}.sRLa1a_conversationKnowledgeHeader select{max-width:92px}}@container sRLa1a_hero-context (width<=620px){.sRLa1a_homeTop{flex-wrap:wrap;align-items:flex-start}.sRLa1a_homeLogin{grid-template-columns:1fr}.sRLa1a_homeWorkspace{flex-wrap:wrap;align-items:flex-start}.sRLa1a_homeWorkspace>span{width:100%}.sRLa1a_homeWorkspace>small{text-align:left;flex-basis:100%}.sRLa1a_homeActions{flex-wrap:wrap;justify-content:flex-start}.sRLa1a_homeConnection{display:none}}.sRLa1a_toolCard{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;margin:4px 0;overflow:hidden}.sRLa1a_toolCard[data-state=error]{border-color:var(--dsw-alias-state-error-primary)}.sRLa1a_toolRow{align-items:center;gap:8px;min-height:38px;padding:0 10px;display:flex}.sRLa1a_toolGlyph{color:var(--dsw-alias-label-secondary);flex:none;font-size:13px}.sRLa1a_toolTitle{color:var(--dsw-alias-label-primary);flex:none;font-size:13px;font-weight:500}.sRLa1a_toolSummary{min-width:0;color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:12px;overflow:hidden}.sRLa1a_inspectButton{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:3px 5px;font-size:12px}.sRLa1a_toolPreview{color:var(--dsw-alias-label-secondary);margin:-2px 10px 9px 31px;font-size:12px;line-height:18px}.sRLa1a_evidenceEmpty{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);border-radius:8px;margin:0 10px 9px 31px;padding:9px 10px;font-size:10px}.sRLa1a_evidencePreview{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:9px;margin:0 9px 9px 30px;overflow:hidden}.sRLa1a_evidenceHeading{border-bottom:1px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;min-height:28px;padding:0 9px;display:flex}.sRLa1a_evidenceHeading span{color:var(--dsw-alias-label-secondary);font-size:9px;font-weight:600}.sRLa1a_evidenceHeading small{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, transparent);color:var(--dsw-alias-brand-primary);border-radius:99px;padding:2px 5px;font-size:7px}.sRLa1a_evidencePreview article{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:flex-start;gap:8px;padding:8px 9px;display:flex}.sRLa1a_evidencePreview article:last-child{border-bottom:0}.sRLa1a_evidencePreview article>span{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);width:18px;height:18px;color:var(--dsw-alias-brand-primary);border-radius:6px;flex:none;place-items:center;font-size:8px;font-weight:650;display:grid}.sRLa1a_evidencePreview article>div{flex:1;min-width:0}.sRLa1a_evidencePreview strong{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:9px;display:block;overflow:hidden}.sRLa1a_evidencePreview p{color:var(--dsw-alias-label-tertiary);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:3px 0 0;font-size:8px;line-height:12px;display:-webkit-box;overflow:hidden}.sRLa1a_evidencePreview article>button{color:var(--dsw-alias-brand-primary);font:inherit;cursor:pointer;background:0 0;border:0;flex:none;font-size:8px}.sRLa1a_answerPreview{border:1px solid color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, var(--dsw-alias-border-l2));background:linear-gradient(120deg, color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-base)), var(--dsw-alias-bg-base));border-radius:9px;margin:0 9px 9px 30px;padding:10px}.sRLa1a_answerPreview>p{color:var(--dsw-alias-label-secondary);white-space:pre-wrap;-webkit-line-clamp:5;-webkit-box-orient:vertical;margin:0;font-size:9px;line-height:15px;display:-webkit-box;overflow:hidden}.sRLa1a_answerPreview>div{align-items:center;gap:5px;margin-top:8px;display:flex;overflow:hidden}.sRLa1a_answerPreview>div>span{color:var(--dsw-alias-label-tertiary);flex:none;font-size:8px}.sRLa1a_answerPreview button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);min-width:0;color:var(--dsw-alias-label-secondary);font:inherit;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;border-radius:99px;align-items:center;gap:4px;padding:3px 7px 3px 4px;font-size:7px;display:inline-flex;overflow:hidden}.sRLa1a_answerPreview button b{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 10%, transparent);width:14px;height:14px;color:var(--dsw-alias-brand-primary);border-radius:50%;flex:none;place-items:center;font-size:7px;display:grid}.sRLa1a_toolDetails{color:var(--dsw-alias-label-tertiary);margin:0 10px 9px 31px;font-size:11px}.sRLa1a_toolOutput{background:var(--dsw-alias-bg-layer-3);max-height:260px;color:var(--dsw-alias-label-secondary);font-family:var(--dsh-font-mono,monospace);white-space:pre-wrap;word-break:break-word;border-radius:7px;margin:6px 0 0;padding:8px;font-size:11px;line-height:17px;overflow:auto}.sRLa1a_settingsPanel{flex-direction:column;gap:16px;max-width:760px;padding:4px 2px 20px;display:flex}.sRLa1a_settingsPanel>header{align-items:center;gap:12px;padding:4px 2px 2px;display:flex}.sRLa1a_settingsPanel>header>div{min-width:0}.sRLa1a_settingsPanel h3{color:var(--dsw-alias-label-primary);margin:0;font-size:16px}.sRLa1a_settingsPanel header p{color:var(--dsw-alias-label-secondary);margin:4px 0 0;font-size:11px;line-height:17px}.sRLa1a_settingsFields{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;overflow:hidden}.sRLa1a_settingsField{border-bottom:1px solid var(--dsw-alias-border-l2);flex-direction:column;gap:6px;padding:13px 14px;display:flex}.sRLa1a_settingsField:last-child{border-bottom:0}.sRLa1a_settingsField>span{align-items:center;gap:8px;display:flex}.sRLa1a_settingsField strong{color:var(--dsw-alias-label-primary);font-size:11px}.sRLa1a_settingsField em{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);color:var(--dsw-alias-brand-primary);border-radius:99px;padding:2px 7px;font-size:8px;font-style:normal}.sRLa1a_settingsField input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);height:34px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;outline:none;padding:0 10px;font-size:11px}.sRLa1a_settingsField input:focus{border-color:var(--dsw-alias-brand-primary)}.sRLa1a_settingsField input:disabled{cursor:not-allowed;opacity:.65}.sRLa1a_settingsField small{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:14px}.sRLa1a_settingsRestart,.sRLa1a_settingsMessage{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border-radius:8px;margin:0;padding:9px 11px;font-size:10px;line-height:15px}.sRLa1a_settingsRestart[data-pending=true]{background:color-mix(in srgb, #e5a21a 10%, var(--dsw-alias-bg-layer-2));color:#b77800}.sRLa1a_settingsMessage{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, var(--dsw-alias-bg-layer-2))}.sRLa1a_settingsPanel>footer{justify-content:flex-end;gap:8px;display:flex}.sRLa1a_settingsPanel>footer button{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-button-ghost-fill);min-width:104px;height:34px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:8px;padding:0 12px;font-size:10px}.sRLa1a_settingsPanel>footer button[data-primary=true]{border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:#fff}.sRLa1a_settingsPanel>footer button:disabled{cursor:not-allowed;opacity:.55}@media (width<=760px){[data-cangzhi-workbench=true]{padding-right:0}.sRLa1a_knowledgeWorkbench{min-width:0;max-width:100vw;width:min(100vw,520px)!important}.sRLa1a_workbenchResize{display:none}.sRLa1a_overlay{border-radius:10px;inset:4px}.sRLa1a_consoleHeader{flex-wrap:wrap}.sRLa1a_consoleTitle{width:calc(100% - 44px)}.sRLa1a_urlForm{flex-basis:100%;order:2}.sRLa1a_frameHint{display:none}}.sRLa1a_toolCard.sRLa1a_toolCard :where(strong,button,summary,p,pre){font-size:13px;line-height:20px}.sRLa1a_toolCard.sRLa1a_toolCard :where(small,span),.sRLa1a_evidencePreview.sRLa1a_evidencePreview :where(strong,p,button,span,small),.sRLa1a_answerPreview.sRLa1a_answerPreview :where(p,button,span,b){font-size:12px;line-height:18px}";
		const tagId = "dsh-cangzhi/Cangzhi.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-cangzhi";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var Cangzhi_module_css_default = {
			"answerPreview": "sRLa1a_answerPreview",
			"brand": "sRLa1a_brand",
			"cangzhiMark": "sRLa1a_cangzhiMark",
			"capabilityGrid": "sRLa1a_capabilityGrid",
			"categoryForm": "sRLa1a_categoryForm",
			"categoryGrid": "sRLa1a_categoryGrid",
			"centerState": "sRLa1a_centerState",
			"closeButton": "sRLa1a_closeButton",
			"connectHero": "sRLa1a_connectHero",
			"connectPanel": "sRLa1a_connectPanel",
			"connectionCard": "sRLa1a_connectionCard",
			"consoleHeader": "sRLa1a_consoleHeader",
			"consoleTitle": "sRLa1a_consoleTitle",
			"contextEmpty": "sRLa1a_contextEmpty",
			"contextHero": "sRLa1a_contextHero",
			"contextList": "sRLa1a_contextList",
			"contextPane": "sRLa1a_contextPane",
			"contextTips": "sRLa1a_contextTips",
			"conversationKnowledgeFallback": "sRLa1a_conversationKnowledgeFallback",
			"conversationKnowledgeHeader": "sRLa1a_conversationKnowledgeHeader",
			"createPanel": "sRLa1a_createPanel",
			"dockLibraryButton": "sRLa1a_dockLibraryButton",
			"dockToggle": "sRLa1a_dockToggle",
			"documentName": "sRLa1a_documentName",
			"documentRow": "sRLa1a_documentRow",
			"drawerBody": "sRLa1a_drawerBody",
			"drawerEmpty": "sRLa1a_drawerEmpty",
			"drawerFileIcon": "sRLa1a_drawerFileIcon",
			"drawerLayer": "sRLa1a_drawerLayer",
			"drawerLogin": "sRLa1a_drawerLogin",
			"drawerNotice": "sRLa1a_drawerNotice",
			"drawerPreview": "sRLa1a_drawerPreview",
			"drawerResults": "sRLa1a_drawerResults",
			"drawerSectionTitle": "sRLa1a_drawerSectionTitle",
			"drawerToolbar": "sRLa1a_drawerToolbar",
			"dropZone": "sRLa1a_dropZone",
			"empty": "sRLa1a_empty",
			"errorBanner": "sRLa1a_errorBanner",
			"evidenceEmpty": "sRLa1a_evidenceEmpty",
			"evidenceHeading": "sRLa1a_evidenceHeading",
			"evidencePreview": "sRLa1a_evidencePreview",
			"fileIcon": "sRLa1a_fileIcon",
			"footerButton": "sRLa1a_footerButton",
			"footerButtonRail": "sRLa1a_footerButtonRail",
			"footerIcon": "sRLa1a_footerIcon",
			"footerLabel": "sRLa1a_footerLabel",
			"frameHint": "sRLa1a_frameHint",
			"headerActions": "sRLa1a_headerActions",
			"hero-context": "sRLa1a_hero-context",
			"homeActions": "sRLa1a_homeActions",
			"homeConnection": "sRLa1a_homeConnection",
			"homeIntegration": "sRLa1a_homeIntegration",
			"homeIntro": "sRLa1a_homeIntro",
			"homeLoading": "sRLa1a_homeLoading",
			"homeLogin": "sRLa1a_homeLogin",
			"homeNotice": "sRLa1a_homeNotice",
			"homePrimary": "sRLa1a_homePrimary",
			"homeTop": "sRLa1a_homeTop",
			"homeWorkspace": "sRLa1a_homeWorkspace",
			"inspectButton": "sRLa1a_inspectButton",
			"knowledgeDock": "sRLa1a_knowledgeDock",
			"knowledgeDockTitle": "sRLa1a_knowledgeDockTitle",
			"knowledgeDockTop": "sRLa1a_knowledgeDockTop",
			"knowledgeDrawer": "sRLa1a_knowledgeDrawer",
			"knowledgePrompts": "sRLa1a_knowledgePrompts",
			"knowledgeWorkbench": "sRLa1a_knowledgeWorkbench",
			"libraryToolbar": "sRLa1a_libraryToolbar",
			"loginForm": "sRLa1a_loginForm",
			"loginMark": "sRLa1a_loginMark",
			"loginPanel": "sRLa1a_loginPanel",
			"modeTabs": "sRLa1a_modeTabs",
			"nativeBadge": "sRLa1a_nativeBadge",
			"navSection": "sRLa1a_navSection",
			"overlay": "sRLa1a_overlay",
			"pageEyebrow": "sRLa1a_pageEyebrow",
			"pageHeader": "sRLa1a_pageHeader",
			"panel": "sRLa1a_panel",
			"panelTitle": "sRLa1a_panelTitle",
			"previewPlaceholder": "sRLa1a_previewPlaceholder",
			"previewToolbar": "sRLa1a_previewToolbar",
			"primaryButton": "sRLa1a_primaryButton",
			"progressText": "sRLa1a_progressText",
			"quickActions": "sRLa1a_quickActions",
			"refreshButton": "sRLa1a_refreshButton",
			"rowActions": "sRLa1a_rowActions",
			"searchForm": "sRLa1a_searchForm",
			"searchMeta": "sRLa1a_searchMeta",
			"searchResults": "sRLa1a_searchResults",
			"secondaryButton": "sRLa1a_secondaryButton",
			"securityNote": "sRLa1a_securityNote",
			"settingsField": "sRLa1a_settingsField",
			"settingsFields": "sRLa1a_settingsFields",
			"settingsMessage": "sRLa1a_settingsMessage",
			"settingsPanel": "sRLa1a_settingsPanel",
			"settingsRestart": "sRLa1a_settingsRestart",
			"sidebarHealthDot": "sRLa1a_sidebarHealthDot",
			"spaceActions": "sRLa1a_spaceActions",
			"spaceBody": "sRLa1a_spaceBody",
			"spaceCreate": "sRLa1a_spaceCreate",
			"spaceFields": "sRLa1a_spaceFields",
			"spaceGrid": "sRLa1a_spaceGrid",
			"spaceIcon": "sRLa1a_spaceIcon",
			"spaceIntro": "sRLa1a_spaceIntro",
			"spacePanel": "sRLa1a_spacePanel",
			"spacesLayout": "sRLa1a_spacesLayout",
			"stats": "sRLa1a_stats",
			"status": "sRLa1a_status",
			"systemStatus": "sRLa1a_systemStatus",
			"systemStatusTitle": "sRLa1a_systemStatusTitle",
			"tokenList": "sRLa1a_tokenList",
			"toolCard": "sRLa1a_toolCard",
			"toolDetails": "sRLa1a_toolDetails",
			"toolGlyph": "sRLa1a_toolGlyph",
			"toolOutput": "sRLa1a_toolOutput",
			"toolPreview": "sRLa1a_toolPreview",
			"toolRow": "sRLa1a_toolRow",
			"toolSummary": "sRLa1a_toolSummary",
			"toolTitle": "sRLa1a_toolTitle",
			"toolbarButton": "sRLa1a_toolbarButton",
			"uploadList": "sRLa1a_uploadList",
			"uploadPanel": "sRLa1a_uploadPanel",
			"urlForm": "sRLa1a_urlForm",
			"workbenchHeader": "sRLa1a_workbenchHeader",
			"workbenchNotice": "sRLa1a_workbenchNotice",
			"workbenchPane": "sRLa1a_workbenchPane",
			"workbenchPreview": "sRLa1a_workbenchPreview",
			"workbenchResize": "sRLa1a_workbenchResize",
			"workbenchResults": "sRLa1a_workbenchResults",
			"workbenchStatus": "sRLa1a_workbenchStatus",
			"workbenchTabs": "sRLa1a_workbenchTabs",
			"workspace": "sRLa1a_workspace",
			"workspaceMain": "sRLa1a_workspaceMain",
			"workspaceNav": "sRLa1a_workspaceNav",
			"workspaceSelector": "sRLa1a_workspaceSelector"
		};
		//#endregion
		//#region src/client/plugin.tsx
		const NS = "cangzhi";
		const API = "/_dsh-cangzhi-api";
		const TOOL_PREFIX = "mcp__cangzhi__";
		const RAW_TOOLS = [
			"knowledge_list_scopes",
			"knowledge_list_facets",
			"knowledge_list_documents",
			"knowledge_search",
			"knowledge_ask",
			"knowledge_get_document",
			"knowledge_get_chunk",
			"knowledge_list_datasets",
			"knowledge_get_dataset_schema",
			"knowledge_preview_dataset_rows",
			"knowledge_query_dataset",
			"knowledge_get_evidence_by_chunk",
			"knowledge_get_evidence_by_dataset",
			"knowledge_preview_evidence_rows"
		];
		const zh = {
			footer: "藏知",
			consoleTitle: "藏知管理中心",
			close: "关闭",
			frameHint: "DSH 原生知识工作台",
			running: "执行中…",
			done: "已完成",
			failed: "调用失败",
			items: "{{count}} 项",
			inspect: "检查调用",
			details: "查看原始结果",
			healthChecking: "正在检查藏知服务",
			healthOk: "藏知服务正常",
			healthWarning: "藏知有项目需要处理",
			healthError: "藏知服务异常",
			settingsTab: "藏知",
			settingsTitle: "藏知连接",
			settingsDescription: "配置 DSH 使用的藏知服务地址和默认知识空间。访问令牌仍由 DSH 凭据存储单独管理。",
			settingsApiUrl: "API 地址",
			settingsApiHint: "藏知 REST API 与 MCP 服务的基础地址。",
			settingsWebUrl: "Web 地址",
			settingsWebHint: "藏知管理页面的基础地址。",
			settingsWorkspace: "默认知识空间",
			settingsWorkspaceHint: "DSH 启动时使用的空间标识；当前空间仍可在会话中切换。",
			settingsManaged: "由管理员环境变量锁定",
			settingsRestart: "保存后需要重启 DSH 才会切换连接。",
			settingsRestartPending: "配置已保存，当前进程仍在使用旧连接，请重启 DSH。",
			settingsSave: "保存配置",
			settingsSaving: "正在保存…",
			settingsSaved: "配置已保存。",
			settingsTest: "测试连接",
			settingsTesting: "正在测试…",
			settingsTestOk: "藏知 API 连接正常。",
			settingsTestFailed: "连接测试失败",
			settingsInvalidUrl: "请输入不含账号密码的绝对 HTTP(S) 地址。",
			settingsInvalidWorkspace: "空间标识只能使用小写字母、数字和连字符，最长 64 个字符。",
			settingsUnavailable: "当前 DSH 未提供可写的设置存储。",
			tools: {
				knowledge_list_scopes: "知识范围",
				knowledge_list_facets: "知识分类",
				knowledge_list_documents: "文档列表",
				knowledge_search: "知识搜索",
				knowledge_ask: "知识问答",
				knowledge_get_document: "读取文档",
				knowledge_get_chunk: "读取片段",
				knowledge_list_datasets: "数据集列表",
				knowledge_get_dataset_schema: "数据集结构",
				knowledge_preview_dataset_rows: "预览数据集",
				knowledge_query_dataset: "查询数据集",
				knowledge_get_evidence_by_chunk: "片段证据",
				knowledge_get_evidence_by_dataset: "数据集证据",
				knowledge_preview_evidence_rows: "预览证据"
			}
		};
		const en = {
			footer: "藏知",
			consoleTitle: "藏知管理中心",
			close: "Close",
			frameHint: "Native knowledge workspace for DSH",
			running: "Running…",
			done: "Completed",
			failed: "Call failed",
			items: "{{count}} items",
			inspect: "Inspect call",
			details: "Show raw result",
			healthChecking: "Checking Cangzhi services",
			healthOk: "Cangzhi services are healthy",
			healthWarning: "Cangzhi needs attention",
			healthError: "Cangzhi services are unavailable",
			settingsTab: "Cangzhi",
			settingsTitle: "Cangzhi connection",
			settingsDescription: "Configure the Cangzhi services and default workspace used by DSH. Access tokens remain in the separate DSH credential store.",
			settingsApiUrl: "API URL",
			settingsApiHint: "Base URL for the Cangzhi REST API and MCP service.",
			settingsWebUrl: "Web URL",
			settingsWebHint: "Base URL for the Cangzhi management site.",
			settingsWorkspace: "Default workspace",
			settingsWorkspaceHint: "Workspace slug used when DSH starts; the active workspace can still be changed in a conversation.",
			settingsManaged: "Locked by an administrator environment variable",
			settingsRestart: "Restart DSH after saving to activate the new connection.",
			settingsRestartPending: "Settings are saved, but this process still uses the old connection. Restart DSH.",
			settingsSave: "Save settings",
			settingsSaving: "Saving…",
			settingsSaved: "Settings saved.",
			settingsTest: "Test connection",
			settingsTesting: "Testing…",
			settingsTestOk: "The Cangzhi API is reachable.",
			settingsTestFailed: "Connection test failed",
			settingsInvalidUrl: "Enter an absolute HTTP(S) URL without a username or password.",
			settingsInvalidWorkspace: "Use lowercase letters, numbers, and hyphens, up to 64 characters.",
			settingsUnavailable: "This DSH instance does not provide writable settings storage.",
			tools: {
				knowledge_list_scopes: "Knowledge scopes",
				knowledge_list_facets: "Knowledge facets",
				knowledge_list_documents: "Documents",
				knowledge_search: "Knowledge search",
				knowledge_ask: "Knowledge answer",
				knowledge_get_document: "Read document",
				knowledge_get_chunk: "Read chunk",
				knowledge_list_datasets: "Datasets",
				knowledge_get_dataset_schema: "Dataset schema",
				knowledge_preview_dataset_rows: "Preview dataset",
				knowledge_query_dataset: "Query dataset",
				knowledge_get_evidence_by_chunk: "Chunk evidence",
				knowledge_get_evidence_by_dataset: "Dataset evidence",
				knowledge_preview_evidence_rows: "Preview evidence"
			}
		};
		function createConsoleFace() {
			let snapshot = {
				open: false,
				knowledgeOpen: false
			};
			const listeners = /* @__PURE__ */ new Set();
			const publish = (next) => {
				if (next.open === snapshot.open && next.knowledgeOpen === snapshot.knowledgeOpen) return;
				snapshot = next;
				for (const listener of listeners) listener();
			};
			return {
				hooks: { cangzhiConsole: {
					getSnapshot: () => snapshot,
					subscribe: (listener) => {
						listeners.add(listener);
						return () => {
							listeners.delete(listener);
						};
					}
				} },
				openConsole: () => {
					publish({
						open: true,
						knowledgeOpen: false
					});
				},
				closeConsole: () => {
					publish({
						...snapshot,
						open: false
					});
				},
				openKnowledge: () => {
					publish({
						open: false,
						knowledgeOpen: true
					});
				},
				closeKnowledge: () => {
					publish({
						...snapshot,
						knowledgeOpen: false
					});
				}
			};
		}
		function CangzhiMark({ size, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `${Cangzhi_module_css_default.cangzhiMark} ${className ?? ""}`,
				style: {
					width: size,
					height: size,
					fontSize: Math.max(13, size * .55)
				},
				children: "知"
			});
		}
		function setWorkspaceCookie(slug) {
			document.cookie = `cangzhi_workspace=${encodeURIComponent(slug)}; Path=/; Max-Age=31536000; SameSite=Lax`;
		}
		async function syncModelWorkspace(slug) {
			const response = await fetch("/_cangzhi-plugin/workspace", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ slug })
			});
			if (!response.ok) throw new Error(await errorMessage(response, "模型知识空间切换失败"));
			window.dispatchEvent(new CustomEvent("cangzhi-workspace-changed", { detail: { slug } }));
		}
		function HomeIntegration({ openConsole, openKnowledge }) {
			const [auth, setAuth] = (0, react.useState)(null);
			const [plugin, setPlugin] = (0, react.useState)(null);
			const [workspace, setWorkspace] = (0, react.useState)(null);
			const [workspaces, setWorkspaces] = (0, react.useState)([]);
			const [username, setUsername] = (0, react.useState)("");
			const [password, setPassword] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)("");
			const fileInput = (0, react.useRef)(null);
			const load = async () => {
				const [authResponse, pluginResponse] = await Promise.all([fetch(`${API}/auth/status`, {
					credentials: "include",
					cache: "no-store"
				}), fetch("/_cangzhi-plugin/status", { cache: "no-store" })]);
				const authValue = await authResponse.json();
				setAuth(authValue);
				if (pluginResponse.ok) setPlugin(await pluginResponse.json());
				if (!authValue.authenticated) return;
				const [workspaceResponse, workspacesResponse] = await Promise.all([fetch(`${API}/workspaces/current`, {
					credentials: "include",
					cache: "no-store"
				}), fetch(`${API}/workspaces`, {
					credentials: "include",
					cache: "no-store"
				})]);
				if (!workspaceResponse.ok || !workspacesResponse.ok) return;
				const currentWorkspace = await workspaceResponse.json();
				setWorkspace(currentWorkspace);
				setWorkspaces(await workspacesResponse.json());
				await syncModelWorkspace(currentWorkspace.slug);
			};
			(0, react.useEffect)(() => {
				load().catch(() => {
					setNotice("藏知服务暂时不可用");
				});
			}, []);
			const login = async (event) => {
				event.preventDefault();
				setBusy(true);
				setNotice("");
				const response = await fetch(`${API}/auth/login`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						username,
						password
					})
				});
				if (!response.ok) {
					setNotice(await errorMessage(response, "登录失败"));
					setBusy(false);
					return;
				}
				setPassword("");
				if (plugin?.mcpConfigured) {
					setNotice("登录成功，藏知对话已经连接");
					await load();
					setBusy(false);
					return;
				}
				await connect();
			};
			const connect = async () => {
				setBusy(true);
				setNotice("正在创建 DSH 专用访问令牌…");
				const response = await fetch(`${API}/access-tokens`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						name: "DSH 对话插件",
						scopes: [
							"knowledge:read",
							"knowledge:search",
							"knowledge:ask"
						]
					})
				});
				if (!response.ok) {
					setNotice(await errorMessage(response, "令牌创建失败"));
					setBusy(false);
					return;
				}
				const { token } = await response.json();
				const setup = await fetch("/_cangzhi-plugin/token", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ token })
				});
				setNotice(setup.ok ? "连接成功，藏知工具正在自动上线" : await errorMessage(setup, "DSH 凭据写入失败"));
				setBusy(false);
				await load();
			};
			const upload = async (files) => {
				if (!files?.length) return;
				setBusy(true);
				for (const [index, file] of Array.from(files).entries()) {
					setNotice(`正在上传 ${index + 1}/${files.length}：${file.name}`);
					const body = new FormData();
					body.append("file", file);
					body.append("title", "");
					const response = await fetch(`${API}/files/upload`, {
						method: "POST",
						credentials: "include",
						body
					});
					if (!response.ok) {
						setNotice(await errorMessage(response, `${file.name} 上传失败`));
						setBusy(false);
						return;
					}
				}
				setNotice("上传完成，已进入知识处理队列");
				setBusy(false);
				await load();
			};
			const switchWorkspace = async (slug) => {
				const next = workspaces.find((item) => item.slug === slug);
				if (next === void 0 || next.slug === workspace?.slug) return;
				setBusy(true);
				setNotice("正在切换知识空间…");
				try {
					setWorkspaceCookie(next.slug);
					await syncModelWorkspace(next.slug);
					setWorkspace(next);
					setNotice(`已切换到“${next.name}”，新会话将使用这个空间`);
					await load();
				} catch (caught) {
					setNotice(caught instanceof Error ? caught.message : "知识空间切换失败");
				} finally {
					setBusy(false);
				}
			};
			if (auth === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: Cangzhi_module_css_default.homeIntegration,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: Cangzhi_module_css_default.homeLoading,
					children: "正在连接藏知知识库…"
				})
			});
			if (!auth.authenticated) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.homeIntegration,
				"data-state": "login",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.homeIntro,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 38 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "连接藏知知识库" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "登录后，DSH 可以直接检索、引用和管理你的知识。" })] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: Cangzhi_module_css_default.homeLogin,
						onSubmit: login,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: username,
								onChange: (event) => setUsername(event.target.value),
								placeholder: "藏知用户名",
								autoComplete: "username",
								required: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "密码",
								type: "password",
								autoComplete: "current-password",
								required: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy,
								children: busy ? "登录中…" : "登录并连接"
							})
						]
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.homeNotice,
						children: notice
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.homeIntegration,
				"data-state": "ready",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.homeTop,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.homeIntro,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 30 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "知识范围" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "决定模型从哪些藏知资料中检索和引用" })] })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Cangzhi_module_css_default.homeConnection,
							"data-ok": String(Boolean(plugin?.mcpConfigured)),
							children: plugin?.mcpConfigured ? "模型检索已连接" : "等待连接"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: Cangzhi_module_css_default.homeWorkspace,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "知识空间" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 20 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
								value: workspace?.slug ?? "default",
								disabled: busy,
								onChange: (event) => void switchWorkspace(event.target.value),
								children: workspaces.filter((item) => item.status === "active").map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: item.slug,
									children: item.name
								}, item.id))
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "只控制知识检索，不改变上方运行项目的本地文件与权限" })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.homeActions,
						children: [
							!plugin?.mcpConfigured && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: Cangzhi_module_css_default.homePrimary,
								disabled: busy,
								onClick: () => void connect(),
								children: busy ? "连接中…" : "启用模型检索"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: fileInput,
								type: "file",
								accept: ".pdf,.doc,.docx,.xlsx,.xls,.md,.txt",
								multiple: true,
								hidden: true,
								onChange: (event) => void upload(event.target.files)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: openKnowledge,
								children: "浏览资料"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy,
								onClick: () => fileInput.current?.click(),
								children: "上传知识"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: openConsole,
								children: "管理知识库"
							})
						]
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.homeNotice,
						children: notice
					})
				]
			});
		}
		function KnowledgeDock({ openKnowledge, inputActions }) {
			const [status, setStatus] = (0, react.useState)(null);
			const [workspace, setWorkspace] = (0, react.useState)(null);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const load = async () => {
				const [statusResponse, workspaceResponse] = await Promise.all([fetch("/_cangzhi-plugin/status", { cache: "no-store" }), fetch(`${API}/workspaces/current`, {
					credentials: "include",
					cache: "no-store"
				})]);
				if (statusResponse.ok) setStatus(await statusResponse.json());
				if (workspaceResponse.ok) setWorkspace(await workspaceResponse.json());
			};
			(0, react.useEffect)(() => {
				load();
				const update = () => {
					load();
				};
				const useDocument = (event) => {
					const detail = event.detail;
					if (typeof detail?.prompt === "string") inputActions.setDraft(detail.prompt);
				};
				window.addEventListener("cangzhi-workspace-changed", update);
				window.addEventListener("cangzhi-use-document", useDocument);
				return () => {
					window.removeEventListener("cangzhi-workspace-changed", update);
					window.removeEventListener("cangzhi-use-document", useDocument);
				};
			}, [inputActions]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.knowledgeDock,
				"data-expanded": String(expanded),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.knowledgeDockTop,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 23 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.knowledgeDockTitle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "知识增强" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "data-ok": String(Boolean(status?.mcpConfigured)) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
								workspace?.name ?? status?.activeWorkspace ?? "默认空间",
								" · ",
								status?.mcpConfigured ? "模型会主动检索并引用证据" : "尚未连接模型工具"
							] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: Cangzhi_module_css_default.dockLibraryButton,
							onClick: openKnowledge,
							children: "搜资料"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: Cangzhi_module_css_default.dockToggle,
							"aria-label": expanded ? "收起知识建议" : "展开知识建议",
							onClick: () => setExpanded((value) => !value),
							children: expanded ? "⌃" : "⌄"
						})
					]
				}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.knowledgePrompts,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "试着这样问" }), [
						{
							label: "基于知识回答",
							prompt: "请优先检索当前藏知空间，基于找到的证据回答，并在关键结论后标注来源。\n\n"
						},
						{
							label: "总结近期资料",
							prompt: "请列出当前藏知空间最近更新的资料，归纳核心主题，并附上来源。"
						},
						{
							label: "对比多份资料",
							prompt: "请在当前藏知空间中寻找与以下主题相关的多份资料，对比它们的共同点、差异和依据：\n\n"
						}
					].map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						disabled: !status?.mcpConfigured,
						onClick: () => inputActions.setDraft(item.prompt),
						children: item.label
					}, item.label))]
				})]
			});
		}
		function ConversationKnowledgeHeader({ openKnowledge }) {
			const [workspaces, setWorkspaces] = (0, react.useState)([]);
			const [current, setCurrent] = (0, react.useState)(null);
			const [configured, setConfigured] = (0, react.useState)(false);
			const [activeSlug, setActiveSlug] = (0, react.useState)("default");
			const [busy, setBusy] = (0, react.useState)(false);
			const load = async () => {
				const [statusResponse, listResponse, currentResponse] = await Promise.all([
					fetch("/_cangzhi-plugin/status", { cache: "no-store" }),
					fetch(`${API}/workspaces`, {
						credentials: "include",
						cache: "no-store"
					}),
					fetch(`${API}/workspaces/current`, {
						credentials: "include",
						cache: "no-store"
					})
				]);
				if (statusResponse.ok) {
					const status = await statusResponse.json();
					setConfigured(status.mcpConfigured);
					setActiveSlug(status.activeWorkspace ?? "default");
				}
				if (listResponse.ok) setWorkspaces(await listResponse.json());
				if (currentResponse.ok) setCurrent(await currentResponse.json());
			};
			(0, react.useEffect)(() => {
				load();
				const update = () => {
					load();
				};
				window.addEventListener("cangzhi-workspace-changed", update);
				return () => window.removeEventListener("cangzhi-workspace-changed", update);
			}, []);
			const change = async (slug) => {
				const next = workspaces.find((item) => item.slug === slug);
				if (next === void 0 || next.slug === current?.slug) return;
				setBusy(true);
				try {
					setWorkspaceCookie(slug);
					await syncModelWorkspace(slug);
					setCurrent(next);
				} finally {
					setBusy(false);
				}
			};
			if (current === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				className: Cangzhi_module_css_default.conversationKnowledgeFallback,
				onClick: openKnowledge,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 18 }), configured ? `藏知 · ${activeSlug}` : "连接藏知"]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Cangzhi_module_css_default.conversationKnowledgeHeader,
				title: "页面与模型工具会同步切换知识空间",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 18 }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { "data-ok": String(configured) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "知识空间" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
						value: current.slug,
						disabled: busy,
						onChange: (event) => void change(event.target.value),
						children: workspaces.filter((item) => item.status === "active").map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: item.slug,
							children: item.name
						}, item.id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						"aria-label": "搜索藏知资料",
						onClick: openKnowledge,
						children: "⌕"
					})
				]
			});
		}
		function validConnectionUrl(value) {
			try {
				const url = new URL(value);
				return (url.protocol === "http:" || url.protocol === "https:") && url.username === "" && url.password === "";
			} catch {
				return false;
			}
		}
		function CangzhiSettingsTab({ settingsScope, t }) {
			const snapshot = (0, react.useSyncExternalStore)((listener) => settingsScope.subscribe(listener), () => settingsScope.getSnapshot());
			const [status, setStatus] = (0, react.useState)(null);
			const [apiUrl, setApiUrl] = (0, react.useState)("");
			const [webUrl, setWebUrl] = (0, react.useState)("");
			const [defaultWorkspace, setDefaultWorkspace] = (0, react.useState)("default");
			const [busy, setBusy] = (0, react.useState)(null);
			const [message, setMessage] = (0, react.useState)("");
			const loadStatus = async () => {
				const response = await fetch("/_cangzhi-plugin/status", { cache: "no-store" });
				if (!response.ok) throw new Error(await errorMessage(response, t("settingsUnavailable")));
				const plugin = await response.json();
				if (plugin.connectionSettings !== void 0) setStatus(plugin.connectionSettings);
			};
			(0, react.useEffect)(() => {
				if (snapshot.value === void 0) return;
				setApiUrl(snapshot.value.apiUrl);
				setWebUrl(snapshot.value.webUrl);
				setDefaultWorkspace(snapshot.value.defaultWorkspace);
			}, [snapshot.value]);
			(0, react.useEffect)(() => {
				loadStatus().catch(() => {
					setMessage(t("settingsUnavailable"));
				});
			}, []);
			const validate = () => {
				if (!validConnectionUrl(apiUrl) || !validConnectionUrl(webUrl)) {
					setMessage(t("settingsInvalidUrl"));
					return false;
				}
				if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(defaultWorkspace.trim().toLowerCase())) {
					setMessage(t("settingsInvalidWorkspace"));
					return false;
				}
				return true;
			};
			const test = async () => {
				if (!validate()) return;
				setBusy("test");
				setMessage("");
				try {
					const response = await fetch("/_cangzhi-plugin/settings/test", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							apiUrl,
							webUrl,
							defaultWorkspace
						})
					});
					setMessage(response.ok ? t("settingsTestOk") : await errorMessage(response, t("settingsTestFailed")));
				} catch {
					setMessage(t("settingsTestFailed"));
				} finally {
					setBusy(null);
				}
			};
			const save = async () => {
				if (!validate() || snapshot.status !== "ready" || !snapshot.writable) return;
				setBusy("save");
				setMessage("");
				const locks = status?.locks;
				const ops = [
					...locks?.apiUrl ? [] : [{
						op: "set",
						path: ["apiUrl"],
						value: apiUrl.trim()
					}],
					...locks?.webUrl ? [] : [{
						op: "set",
						path: ["webUrl"],
						value: webUrl.trim()
					}],
					...locks?.defaultWorkspace ? [] : [{
						op: "set",
						path: ["defaultWorkspace"],
						value: defaultWorkspace.trim().toLowerCase()
					}]
				];
				try {
					if (ops.length > 0) await settingsScope.mutate(ops, snapshot.revision);
					await loadStatus();
					setMessage(t("settingsSaved"));
				} catch {
					setMessage(t("settingsUnavailable"));
				} finally {
					setBusy(null);
				}
			};
			const locks = status?.locks;
			const unavailable = status === null || snapshot.status !== "ready" || !snapshot.writable;
			const field = (key, label, hint, value, update) => {
				const locked = locks?.[key] ?? false;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: Cangzhi_module_css_default.settingsField,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: label }), locked && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: t("settingsManaged") })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value,
							disabled: unavailable || locked || busy !== null,
							onChange: (event) => update(event.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: hint })
					]
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.settingsPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 36 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settingsTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("settingsDescription") })] })] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.settingsFields,
						children: [
							field("apiUrl", t("settingsApiUrl"), t("settingsApiHint"), apiUrl, setApiUrl),
							field("webUrl", t("settingsWebUrl"), t("settingsWebHint"), webUrl, setWebUrl),
							field("defaultWorkspace", t("settingsWorkspace"), t("settingsWorkspaceHint"), defaultWorkspace, setDefaultWorkspace)
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.settingsRestart,
						"data-pending": String(Boolean(status?.restartRequired)),
						children: status?.restartRequired ? t("settingsRestartPending") : t("settingsRestart")
					}),
					unavailable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.settingsMessage,
						children: t("settingsUnavailable")
					}),
					message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.settingsMessage,
						role: "status",
						children: message
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						disabled: unavailable || busy !== null,
						onClick: () => void test(),
						children: busy === "test" ? t("settingsTesting") : t("settingsTest")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						"data-primary": "true",
						disabled: unavailable || busy !== null,
						onClick: () => void save(),
						children: busy === "save" ? t("settingsSaving") : t("settingsSave")
					})] })
				]
			});
		}
		function ConsoleAction({ wide, useCangzhiConsole, openConsole, t }) {
			const state = useCangzhiConsole((value) => value);
			const [health, setHealth] = (0, react.useState)("checking");
			(0, react.useEffect)(() => {
				let alive = true;
				const loadHealth = async () => {
					try {
						const pluginResponse = await fetch("/_cangzhi-plugin/status", { cache: "no-store" });
						if (!pluginResponse.ok) throw new Error("plugin status unavailable");
						const pluginStatus = await pluginResponse.json();
						let next = pluginStatus.apiConnected ? pluginStatus.mcpConfigured ? "ok" : "warning" : "error";
						if (pluginStatus.apiConnected) {
							const systemResponse = await fetch(`${API}/system/status`, {
								credentials: "include",
								cache: "no-store"
							});
							if (systemResponse.ok) {
								if ((await systemResponse.json()).status === "degraded") next = "warning";
							}
						}
						if (alive) setHealth(next);
					} catch {
						if (alive) setHealth("error");
					}
				};
				loadHealth();
				const timer = window.setInterval(() => {
					loadHealth();
				}, 3e4);
				return () => {
					alive = false;
					window.clearInterval(timer);
				};
			}, []);
			const healthLabel = health === "ok" ? t("healthOk") : health === "warning" ? t("healthWarning") : health === "error" ? t("healthError") : t("healthChecking");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: wide ? Cangzhi_module_css_default.footerButton : `${Cangzhi_module_css_default.footerButton} ${Cangzhi_module_css_default.footerButtonRail}`,
				"data-active": String(state.open),
				"aria-label": t("consoleTitle"),
				title: `${t("consoleTitle")} · ${healthLabel}`,
				onClick: openConsole,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: Cangzhi_module_css_default.footerIcon,
						"aria-hidden": true,
						children: "▤"
					}),
					wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: Cangzhi_module_css_default.footerLabel,
						children: t("footer")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: Cangzhi_module_css_default.sidebarHealthDot,
						"data-state": health,
						"aria-hidden": true
					})
				]
			});
		}
		async function errorMessage(response, fallback) {
			const value = await response.json().catch(() => null);
			if (typeof value?.detail === "string") return value.detail;
			if (typeof value?.detail === "object" && typeof value.detail.message === "string") return value.detail.message;
			if (typeof value?.error === "string") return value.error;
			return fallback;
		}
		function LoginPanel({ onAuthenticated }) {
			const [username, setUsername] = (0, react.useState)("");
			const [password, setPassword] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const submit = async (event) => {
				event.preventDefault();
				setBusy(true);
				setError("");
				const response = await fetch(`${API}/auth/login`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						username,
						password
					})
				});
				setBusy(false);
				if (!response.ok) {
					setError(await errorMessage(response, "登录失败"));
					return;
				}
				onAuthenticated();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Cangzhi_module_css_default.loginPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.loginMark,
						children: "▤"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "登录藏知" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "登录后即可在 DSH 内上传、管理和维护知识库。" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: Cangzhi_module_css_default.loginForm,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: username,
								onChange: (event) => setUsername(event.target.value),
								placeholder: "用户名",
								autoComplete: "username",
								required: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								value: password,
								onChange: (event) => setPassword(event.target.value),
								placeholder: "密码",
								type: "password",
								autoComplete: "current-password",
								required: true
							}),
							error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: Cangzhi_module_css_default.errorBanner,
								children: error
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								disabled: busy,
								children: busy ? "登录中…" : "登录"
							})
						]
					})
				]
			});
		}
		function NativeWorkspace() {
			const [auth, setAuth] = (0, react.useState)(null);
			const [plugin, setPlugin] = (0, react.useState)(null);
			const [systemStatus, setSystemStatus] = (0, react.useState)(null);
			const [tab, setTab] = (0, react.useState)("overview");
			const [documents, setDocuments] = (0, react.useState)([]);
			const [categories, setCategories] = (0, react.useState)([]);
			const [workspaces, setWorkspaces] = (0, react.useState)([]);
			const [currentWorkspace, setCurrentWorkspace] = (0, react.useState)(null);
			const [total, setTotal] = (0, react.useState)(0);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const refresh = async () => {
				setLoading(true);
				setError("");
				try {
					const authValue = await (await fetch(`${API}/auth/status`, {
						credentials: "include",
						cache: "no-store"
					})).json();
					setAuth(authValue);
					const pluginResponse = await fetch("/_cangzhi-plugin/status", { cache: "no-store" });
					if (pluginResponse.ok) setPlugin(await pluginResponse.json());
					if (authValue.authenticated) {
						const [documentResponse, categoryResponse, workspacesResponse, currentWorkspaceResponse, systemResponse] = await Promise.all([
							fetch(`${API}/documents/overview?limit=200&offset=0&include_processing=true`, {
								credentials: "include",
								cache: "no-store"
							}),
							fetch(`${API}/categories`, {
								credentials: "include",
								cache: "no-store"
							}),
							fetch(`${API}/workspaces`, {
								credentials: "include",
								cache: "no-store"
							}),
							fetch(`${API}/workspaces/current`, {
								credentials: "include",
								cache: "no-store"
							}),
							fetch(`${API}/system/status`, {
								credentials: "include",
								cache: "no-store"
							})
						]);
						if (!documentResponse.ok || !categoryResponse.ok || !workspacesResponse.ok || !currentWorkspaceResponse.ok) throw new Error("知识库读取失败");
						setDocuments(await documentResponse.json());
						setTotal(Number(documentResponse.headers.get("x-total-count") ?? 0));
						setCategories(await categoryResponse.json());
						setWorkspaces(await workspacesResponse.json());
						const current = await currentWorkspaceResponse.json();
						setCurrentWorkspace(current);
						if (systemResponse.ok) setSystemStatus(await systemResponse.json());
						await syncModelWorkspace(current.slug);
					}
				} catch (caught) {
					setError(caught instanceof Error ? caught.message : "藏知服务不可用");
				} finally {
					setLoading(false);
				}
			};
			(0, react.useEffect)(() => {
				refresh();
			}, []);
			const logout = async () => {
				await fetch(`${API}/auth/logout`, {
					method: "POST",
					credentials: "include"
				});
				setAuth({
					authenticated: false,
					admin: null
				});
			};
			const switchWorkspace = async (slug) => {
				const next = workspaces.find((item) => item.slug === slug && item.status === "active");
				if (slug === currentWorkspace?.slug || workspaces.some((item) => item.slug === slug) && next === void 0) return;
				setLoading(true);
				setError("");
				try {
					setWorkspaceCookie(next.slug);
					await syncModelWorkspace(next.slug);
					setCurrentWorkspace(next ?? null);
					setTab("overview");
					await refresh();
				} catch (caught) {
					setError(caught instanceof Error ? caught.message : "知识空间切换失败");
					setLoading(false);
				}
			};
			if (loading && auth === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Cangzhi_module_css_default.centerState,
				children: "正在连接藏知…"
			});
			if (auth !== null && !auth.authenticated) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LoginPanel, { onAuthenticated: () => void refresh() });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Cangzhi_module_css_default.workspace,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
					className: Cangzhi_module_css_default.workspaceNav,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.brand,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "藏知" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "Knowledge for DSH" })] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: Cangzhi_module_css_default.workspaceSelector,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "当前知识空间" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									value: currentWorkspace?.slug ?? "default",
									disabled: loading,
									onChange: (event) => void switchWorkspace(event.target.value),
									children: workspaces.filter((item) => item.status === "active").map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: item.slug,
										children: item.name
									}, item.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: currentWorkspace?.description || "内容与模型检索在空间之间隔离" })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: Cangzhi_module_css_default.navSection,
							children: "知识工作"
						}),
						[
							[
								"overview",
								"⌂",
								"总览"
							],
							[
								"search",
								"⌕",
								"搜索知识"
							],
							[
								"documents",
								"▤",
								"资料库"
							],
							[
								"create",
								"✎",
								"快速收录"
							],
							[
								"upload",
								"⇧",
								"上传资料"
							]
						].map(([key, icon, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							"data-active": String(tab === key),
							onClick: () => setTab(key),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: icon }), label]
						}, key)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: Cangzhi_module_css_default.navSection,
							children: "组织与连接"
						}),
						[
							[
								"categories",
								"◇",
								"分类管理"
							],
							[
								"spaces",
								"▦",
								"知识空间"
							],
							[
								"connect",
								"↗",
								"对话接入"
							]
						].map(([key, icon, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							"data-active": String(tab === key),
							onClick: () => setTab(key),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: icon }), label]
						}, key)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.connectionCard,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { "data-ok": String(Boolean(plugin?.mcpConfigured)) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: plugin?.mcpConfigured ? "对话检索已连接" : "管理已连接" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: plugin?.mcpConfigured ? `${plugin.toolCount} 个模型工具可用` : "配置 PAT 后启用模型工具" })] })]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
					className: Cangzhi_module_css_default.workspaceMain,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.pageHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: Cangzhi_module_css_default.pageEyebrow,
									children: currentWorkspace?.name ?? "知识空间"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: tab === "overview" ? "知识工作台" : tab === "search" ? "搜索知识" : tab === "documents" ? "资料库" : tab === "create" ? "快速收录" : tab === "upload" ? "上传资料" : tab === "categories" ? "分类管理" : tab === "spaces" ? "知识空间" : "对话接入" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tab === "overview" ? `你好，${auth?.admin?.username ?? "管理员"}。从这里开始沉淀、整理和使用知识。` : currentWorkspace?.description || "当前操作仅作用于所选知识空间" })
							] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Cangzhi_module_css_default.headerActions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: Cangzhi_module_css_default.refreshButton,
									disabled: loading,
									onClick: () => void refresh(),
									children: loading ? "刷新中…" : "刷新"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: Cangzhi_module_css_default.refreshButton,
									onClick: () => void logout(),
									children: "退出"
								})]
							})]
						}),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: Cangzhi_module_css_default.errorBanner,
							children: error
						}),
						tab === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Overview, {
							documents,
							categories,
							total,
							mcp: plugin?.mcpConfigured ?? false,
							workspace: currentWorkspace,
							system: systemStatus,
							go: setTab
						}),
						tab === "search" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KnowledgeSearch, {}),
						tab === "documents" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Documents, {
							documents,
							categories,
							query,
							setQuery,
							refresh
						}),
						tab === "create" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreateKnowledge, {
							refresh,
							done: () => setTab("documents")
						}),
						tab === "upload" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Upload, {
							refresh,
							done: () => setTab("documents")
						}),
						tab === "categories" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Categories, {
							categories,
							refresh
						}),
						tab === "spaces" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Workspaces, {
							workspaces,
							current: currentWorkspace,
							refresh,
							switchTo: switchWorkspace
						}),
						tab === "connect" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConversationConnect, {
							configured: plugin?.mcpConfigured ?? false,
							refresh
						})
					]
				})]
			});
		}
		function formatCapacity(bytes) {
			if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
			return `${Math.max(0, Math.round(bytes / 1024 ** 2))} MB`;
		}
		function formatUptime(seconds) {
			const days = Math.floor(seconds / 86400);
			if (days > 0) return `${days} 天`;
			const hours = Math.floor(seconds / 3600);
			if (hours > 0) return `${hours} 小时`;
			return `${Math.max(1, Math.floor(seconds / 60))} 分钟`;
		}
		function Overview({ documents, categories, total, mcp, workspace, system, go }) {
			const processing = documents.filter((item) => [
				"processing",
				"created",
				"retry"
			].includes(item.pipeline?.overall_status ?? item.current_version?.processing_status ?? "")).length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.stats,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "知识资料" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: total }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: workspace?.name ?? "当前空间" })
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "知识分类" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: categories.length }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "持续整理中" })
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "处理队列" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: processing }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: processing ? "后台正在处理" : "队列空闲" })
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "模型能力" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: mcp ? "14" : "—" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: mcp ? "对话工具在线" : "等待 PAT 配置" })
						] })
					]
				}),
				system && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: Cangzhi_module_css_default.systemStatus,
					"data-state": system.status,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.systemStatusTitle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "服务状态" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: system.status === "ok" ? "藏知运行正常" : "有项目需要处理" })] })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "API 运行" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatUptime(system.uptime_seconds) })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "数据库" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [system.database.latency_ms, " ms"] })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "存储可用" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatCapacity(system.storage.free_bytes) })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "处理队列" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [
							system.processing.active,
							" 处理中 · ",
							system.processing.waiting,
							" 等待"
						] })] }),
						system.processing.failed > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							"data-warning": "true",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "处理失败" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dd", { children: [system.processing.failed, " 项"] })]
						})
					] })]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.quickActions,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							onClick: () => go("upload"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "⇧" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "上传资料" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "批量添加文件并自动解析" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "→" })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							onClick: () => go("create"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "✎" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "快速收录" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "记录想法或收藏网页链接" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "→" })
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							onClick: () => go("search"),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "⌕" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "验证知识" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "搜索并检查可被模型召回的内容" })] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: "→" })
							]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: Cangzhi_module_css_default.panel,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.panelTitle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "最近资料" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "上传后自动解析、切片并进入检索" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => go("upload"),
							children: "＋ 上传资料"
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DocumentRows, {
						documents: documents.slice(0, 8),
						refresh: () => Promise.resolve(),
						compact: true
					})]
				})
			] });
		}
		function statusOf(item) {
			return item.pipeline?.overall_status ?? item.current_version?.processing_status ?? "created";
		}
		const statusText = {
			completed: "已完成",
			ready: "已完成",
			processing: "处理中",
			created: "等待处理",
			retry: "等待重试",
			failed: "失败",
			unsupported: "未提取"
		};
		function DocumentRows({ documents, refresh, categories = [], compact = false }) {
			const act = async (item, action) => {
				if (action === "delete" && !window.confirm(`将“${item.title}”移入回收站？`)) return;
				const response = await fetch(`${API}/documents/${item.id}${action === "reprocess" ? "/reprocess" : ""}`, {
					method: action === "reprocess" ? "POST" : "DELETE",
					credentials: "include"
				});
				if (!response.ok) window.alert(await errorMessage(response, "操作失败"));
				else await refresh();
			};
			const organize = async (item, categoryId) => {
				const response = await fetch(`${API}/documents/${item.id}/category`, {
					method: "PATCH",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ category_id: categoryId })
				});
				if (!response.ok) window.alert(await errorMessage(response, "分类调整失败"));
				else await refresh();
			};
			if (!documents.length) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Cangzhi_module_css_default.empty,
				children: "还没有资料，先上传第一份知识吧。"
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Cangzhi_module_css_default.documentRows,
				children: documents.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.documentRow,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Cangzhi_module_css_default.fileIcon,
							children: item.content_kind === "dataset" ? "▦" : "▤"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.documentName,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
								item.primary_category?.name ?? "未分类",
								" · ",
								new Date(item.updated_at).toLocaleString()
							] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Cangzhi_module_css_default.status,
							"data-status": statusOf(item),
							children: statusText[statusOf(item)] ?? statusOf(item)
						}),
						!compact && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Cangzhi_module_css_default.rowActions,
							children: [
								categories.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": `调整“${item.title}”的分类`,
									value: item.primary_category?.id ?? "",
									onChange: (event) => {
										const id = Number(event.target.value);
										if (id > 0) organize(item, id);
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										disabled: true,
										children: "整理到…"
									}), categories.map((category) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: category.id,
										children: category.name
									}, category.id))]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									onClick: () => window.open(`${API}/documents/${item.id}/preview`, "_blank", "noopener,noreferrer"),
									children: "预览"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									onClick: () => void act(item, "reprocess"),
									children: "重处理"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									onClick: () => void act(item, "delete"),
									children: "删除"
								})
							]
						})
					]
				}, item.id))
			});
		}
		function Documents({ documents, categories, query, setQuery, refresh }) {
			const [categoryId, setCategoryId] = (0, react.useState)("");
			const [status, setStatus] = (0, react.useState)("");
			const visible = documents.filter((item) => {
				const matchesQuery = item.title.toLowerCase().includes(query.trim().toLowerCase());
				const matchesCategory = categoryId === "" || item.primary_category?.id === Number(categoryId);
				const matchesStatus = status === "" || statusOf(item) === status || status === "completed" && statusOf(item) === "ready";
				return matchesQuery && matchesCategory && matchesStatus;
			});
			const hasFilters = query.trim() !== "" || categoryId !== "" || status !== "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.panel,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.libraryToolbar,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "搜索资料名称…"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: categoryId,
							onChange: (event) => setCategoryId(event.target.value),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: "全部分类"
							}), categories.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: item.id,
								children: item.name
							}, item.id))]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: status,
							onChange: (event) => setStatus(event.target.value),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "",
									children: "全部状态"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "completed",
									children: "已完成"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "processing",
									children: "处理中"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "created",
									children: "等待处理"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "retry",
									children: "等待重试"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: "failed",
									children: "失败"
								})
							]
						}),
						hasFilters && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQuery("");
								setCategoryId("");
								setStatus("");
							},
							children: "清除"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							visible.length,
							" / ",
							documents.length,
							" 条"
						] })
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DocumentRows, {
					documents: visible,
					categories,
					refresh
				})]
			});
		}
		function KnowledgeSearch() {
			const [query, setQuery] = (0, react.useState)("");
			const [hits, setHits] = (0, react.useState)([]);
			const [backend, setBackend] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const search = async (event) => {
				event.preventDefault();
				setBusy(true);
				setError("");
				const response = await fetch(`${API}/search`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						query: query.trim(),
						limit: 30,
						offset: 0
					})
				});
				if (!response.ok) {
					setError(await errorMessage(response, "搜索失败"));
					setBusy(false);
					return;
				}
				const body = await response.json();
				setHits(body.hits);
				setBackend(body.backend);
				setBusy(false);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: Cangzhi_module_css_default.searchForm,
						onSubmit: search,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "搜索标题、正文或知识片段",
							required: true
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							disabled: busy,
							children: busy ? "搜索中…" : "搜索"
						})]
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.errorBanner,
						children: error
					}),
					backend && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: Cangzhi_module_css_default.searchMeta,
						children: [
							hits.length,
							" 个结果 · ",
							backend
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.searchResults,
						children: hits.map((hit, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: hit.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
							hit.source_type,
							" · 匹配度 ",
							(hit.score * 100).toFixed(0),
							"% ",
							hit.categories?.map((item) => `· ${item.name}`).join("")
						] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: hit.snippet })] }, `${hit.document_id}:${index}`))
					}),
					!busy && backend && !hits.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.empty,
						children: "没有找到匹配的知识。"
					})
				]
			});
		}
		function CreateKnowledge({ refresh, done }) {
			const [mode, setMode] = (0, react.useState)("note");
			const [title, setTitle] = (0, react.useState)("");
			const [content, setContent] = (0, react.useState)("");
			const [url, setUrl] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const submit = async (event) => {
				event.preventDefault();
				setBusy(true);
				setMessage("");
				const response = await fetch(mode === "note" ? `${API}/notes` : `${API}/sources/url`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(mode === "note" ? {
						title,
						content
					} : { url })
				});
				if (!response.ok) {
					setMessage(await errorMessage(response, "保存失败"));
					setBusy(false);
					return;
				}
				setMessage(mode === "note" ? "随手记已保存并进入处理队列" : "链接已收录并进入抓取队列");
				setTitle("");
				setContent("");
				setUrl("");
				setBusy(false);
				await refresh();
				window.setTimeout(done, 650);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.createPanel,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.modeTabs,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						"data-active": String(mode === "note"),
						onClick: () => setMode("note"),
						children: "随手记"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						"data-active": String(mode === "url"),
						onClick: () => setMode("url"),
						children: "网页链接"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					children: [
						mode === "note" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (event) => setTitle(event.target.value),
							placeholder: "标题（可选）"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							value: content,
							onChange: (event) => setContent(event.target.value),
							placeholder: "记录想法、会议要点或任何需要沉淀的知识…",
							required: true
						})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							value: url,
							onChange: (event) => setUrl(event.target.value),
							placeholder: "https://example.com/article",
							type: "url",
							required: true
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: Cangzhi_module_css_default.primaryButton,
							disabled: busy,
							children: busy ? "保存中…" : mode === "note" ? "保存随手记" : "收录链接"
						}),
						message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: Cangzhi_module_css_default.progressText,
							children: message
						})
					]
				})]
			});
		}
		function Upload({ refresh, done }) {
			const input = (0, react.useRef)(null);
			const [files, setFiles] = (0, react.useState)([]);
			const [busy, setBusy] = (0, react.useState)(false);
			const [dragging, setDragging] = (0, react.useState)(false);
			const [progress, setProgress] = (0, react.useState)("");
			const supported = (0, react.useMemo)(() => ".pdf,.doc,.docx,.xlsx,.xls,.md,.txt", []);
			const chooseFiles = (next) => {
				setFiles(next.slice(0, 50));
				setProgress(next.length > 50 ? "单次最多保留前 50 个文件" : "");
			};
			const upload = async () => {
				setBusy(true);
				for (let index = 0; index < files.length; index += 1) {
					setProgress(`正在上传 ${index + 1} / ${files.length}：${files[index].name}`);
					const body = new FormData();
					body.append("file", files[index]);
					body.append("title", "");
					const response = await fetch(`${API}/files/upload`, {
						method: "POST",
						credentials: "include",
						body
					});
					if (!response.ok) {
						window.alert(await errorMessage(response, `${files[index].name} 上传失败`));
						setBusy(false);
						return;
					}
				}
				setProgress("上传完成，资料已进入处理队列");
				setFiles([]);
				setBusy(false);
				await refresh();
				window.setTimeout(done, 700);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.uploadPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: input,
						type: "file",
						accept: supported,
						multiple: true,
						hidden: true,
						onChange: (event) => chooseFiles(Array.from(event.target.files ?? []))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: Cangzhi_module_css_default.dropZone,
						"data-dragging": String(dragging),
						onClick: () => input.current?.click(),
						onDragEnter: (event) => {
							event.preventDefault();
							setDragging(true);
						},
						onDragOver: (event) => event.preventDefault(),
						onDragLeave: () => setDragging(false),
						onDrop: (event) => {
							event.preventDefault();
							setDragging(false);
							chooseFiles(Array.from(event.dataTransfer.files));
						},
						disabled: busy,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "⇧" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: dragging ? "松开即可添加文件" : "选择或拖入知识文件" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "PDF、Word、Excel、Markdown、TXT，单次最多 50 个" })
						]
					}),
					files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.uploadList,
						children: files.map((file, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: file.name }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [(file.size / 1024 / 1024).toFixed(2), " MB"] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"aria-label": `移除 ${file.name}`,
								disabled: busy,
								onClick: () => setFiles((current) => current.filter((_, position) => position !== index)),
								children: "×"
							})
						] }, `${file.name}:${file.size}`))
					}),
					progress && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.progressText,
						children: progress
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: Cangzhi_module_css_default.primaryButton,
						disabled: !files.length || busy,
						onClick: () => void upload(),
						children: busy ? "上传中…" : `上传 ${files.length || ""} 个文件`
					})
				]
			});
		}
		function Categories({ categories, refresh }) {
			const [name, setName] = (0, react.useState)("");
			const create = async (event) => {
				event.preventDefault();
				const response = await fetch(`${API}/categories`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ name })
				});
				if (!response.ok) window.alert(await errorMessage(response, "创建失败"));
				else {
					setName("");
					await refresh();
				}
			};
			const rename = async (item) => {
				const next = window.prompt("新的分类名称", item.name)?.trim();
				if (!next || next === item.name) return;
				const response = await fetch(`${API}/categories/${item.id}`, {
					method: "PATCH",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ name: next })
				});
				if (!response.ok) window.alert(await errorMessage(response, "重命名失败"));
				else await refresh();
			};
			const remove = async (item) => {
				if (!window.confirm(`删除分类“${item.name}”？`)) return;
				const response = await fetch(`${API}/categories/${item.id}`, {
					method: "DELETE",
					credentials: "include"
				});
				if (!response.ok) window.alert(await errorMessage(response, "删除失败"));
				else await refresh();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				className: Cangzhi_module_css_default.categoryForm,
				onSubmit: create,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					value: name,
					onChange: (event) => setName(event.target.value),
					placeholder: "新分类名称",
					required: true
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", { children: "新增分类" })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: Cangzhi_module_css_default.categoryGrid,
				children: categories.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
						item.document_count,
						" 条资料 · ",
						item.slug
					] })] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						onClick: () => void rename(item),
						children: "重命名"
					}),
					!item.is_default && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						onClick: () => void remove(item),
						children: "删除"
					})
				] }, item.id))
			})] });
		}
		function Workspaces({ workspaces, current, refresh, switchTo }) {
			const [creating, setCreating] = (0, react.useState)(false);
			const [name, setName] = (0, react.useState)("");
			const [slug, setSlug] = (0, react.useState)("");
			const [description, setDescription] = (0, react.useState)("");
			const [message, setMessage] = (0, react.useState)("");
			const create = async (event) => {
				event.preventDefault();
				setCreating(true);
				setMessage("");
				const response = await fetch(`${API}/workspaces`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						name: name.trim(),
						slug: slug.trim().toLowerCase(),
						description: description.trim() || null
					})
				});
				if (!response.ok) {
					setMessage(await errorMessage(response, "知识空间创建失败"));
					setCreating(false);
					return;
				}
				const created = await response.json();
				setName("");
				setSlug("");
				setDescription("");
				setMessage(`“${created.name}”已创建，正在切换…`);
				setCreating(false);
				await refresh();
				await switchTo(created.slug);
			};
			const edit = async (item) => {
				const nextName = window.prompt("知识空间名称", item.name)?.trim();
				if (!nextName) return;
				const nextDescription = window.prompt("空间说明（可留空）", item.description ?? "");
				if (nextDescription === null) return;
				const response = await fetch(`${API}/workspaces/${encodeURIComponent(item.slug)}`, {
					method: "PATCH",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						name: nextName,
						description: nextDescription.trim()
					})
				});
				if (!response.ok) setMessage(await errorMessage(response, "知识空间更新失败"));
				else await refresh();
			};
			const setArchived = async (item, archived) => {
				if (!archived && !window.confirm(`归档“${item.name}”？空间内资料不会删除，归档后不可检索。`)) return;
				const response = await fetch(`${API}/workspaces/${encodeURIComponent(item.slug)}/${archived ? "restore" : "archive"}`, {
					method: "POST",
					credentials: "include"
				});
				if (!response.ok) setMessage(await errorMessage(response, archived ? "恢复失败" : "归档失败"));
				else await refresh();
			};
			const active = workspaces.filter((item) => item.status === "active");
			const archived = workspaces.filter((item) => item.status === "archived");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Cangzhi_module_css_default.spacesLayout,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Cangzhi_module_css_default.spaceIntro,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▦" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "用空间隔离不同领域的知识" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "每个空间拥有独立的资料、分类和检索上下文。切换后，页面管理和 DSH 大模型会同步使用同一个空间。" })] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "适合区分个人、团队或不同项目" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "分类用于空间内部整理，不替代空间" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: "不需要隔离时，保留默认空间即可" })
						] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: Cangzhi_module_css_default.spacePanel,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: Cangzhi_module_css_default.panelTitle,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "空间列表" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								active.length,
								" 个启用 · ",
								archived.length,
								" 个归档"
							] })] })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: Cangzhi_module_css_default.spaceGrid,
							children: workspaces.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
								"data-current": String(item.slug === current?.slug),
								"data-archived": String(item.status === "archived"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: Cangzhi_module_css_default.spaceIcon,
										children: item.is_default ? "知" : item.name.slice(0, 1)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: Cangzhi_module_css_default.spaceBody,
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.name }),
												item.slug === current?.slug && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "当前" }),
												item.status === "archived" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "已归档" })
											] }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: item.description || "暂无空间说明" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: item.slug })
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: Cangzhi_module_css_default.spaceActions,
										children: [
											item.status === "active" && item.slug !== current?.slug && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												onClick: () => void switchTo(item.slug),
												children: "切换"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												onClick: () => void edit(item),
												children: "编辑"
											}),
											!item.is_default && item.slug !== current?.slug && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												onClick: () => void setArchived(item, item.status === "archived"),
												children: item.status === "archived" ? "恢复" : "归档"
											})
										]
									})
								]
							}, item.id))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: Cangzhi_module_css_default.spaceCreate,
						onSubmit: create,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "新建知识空间" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "空间标识创建后保持不变，建议使用简短英文，例如 product、research。" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Cangzhi_module_css_default.spaceFields,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "空间名称" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: name,
									onChange: (event) => setName(event.target.value),
									placeholder: "例如：产品研发",
									required: true
								})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "空间标识" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: slug,
									onChange: (event) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")),
									placeholder: "product",
									pattern: "[a-z0-9][a-z0-9-]{0,63}",
									required: true
								})] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "空间说明" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								value: description,
								onChange: (event) => setDescription(event.target.value),
								placeholder: "说明这个空间收录什么内容，帮助使用者正确选择。"
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: Cangzhi_module_css_default.primaryButton,
								disabled: creating,
								children: creating ? "创建中…" : "创建并切换"
							}),
							message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: Cangzhi_module_css_default.progressText,
								children: message
							})
						]
					})
				]
			});
		}
		function ConversationConnect({ configured, refresh }) {
			const [busy, setBusy] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [tokens, setTokens] = (0, react.useState)([]);
			const loadTokens = async () => {
				const response = await fetch(`${API}/access-tokens`, {
					credentials: "include",
					cache: "no-store"
				});
				if (response.ok) setTokens((await response.json()).items);
			};
			(0, react.useEffect)(() => {
				loadTokens();
			}, []);
			const connect = async () => {
				setBusy(true);
				setMessage("正在创建最小权限访问令牌…");
				const tokenResponse = await fetch(`${API}/access-tokens`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						name: "DSH 对话插件",
						scopes: [
							"knowledge:read",
							"knowledge:search",
							"knowledge:ask"
						]
					})
				});
				if (!tokenResponse.ok) {
					setMessage(await errorMessage(tokenResponse, "访问令牌创建失败"));
					setBusy(false);
					return;
				}
				const created = await tokenResponse.json();
				setMessage("正在安全写入 DSH 凭据存储…");
				const setupResponse = await fetch("/_cangzhi-plugin/token", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ token: created.token })
				});
				if (!setupResponse.ok) {
					setMessage(await errorMessage(setupResponse, "DSH 凭据写入失败"));
					setBusy(false);
					return;
				}
				setMessage("连接成功，模型工具将在数秒内自动上线。");
				setBusy(false);
				await Promise.all([refresh(), loadTokens()]);
			};
			const disconnect = async () => {
				if (!window.confirm("断开 DSH 与藏知的对话连接？知识管理功能仍然可用。")) return;
				setBusy(true);
				const response = await fetch("/_cangzhi-plugin/token", { method: "DELETE" });
				setMessage(response.ok ? "已断开 DSH 对话连接" : await errorMessage(response, "断开失败"));
				setBusy(false);
				await refresh();
			};
			const revoke = async (id) => {
				if (!window.confirm("撤销这个藏知访问令牌？使用它的客户端会立即失效。")) return;
				const response = await fetch(`${API}/access-tokens/${id}/revoke`, {
					method: "POST",
					credentials: "include"
				});
				if (!response.ok) setMessage(await errorMessage(response, "撤销失败"));
				await loadTokens();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.connectPanel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.connectHero,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"data-ok": String(configured),
							children: configured ? "✓" : "↗"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: configured ? "DSH 对话已连接藏知" : "让大模型直接调用藏知" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: configured ? "知识搜索、问答、文档读取和数据集查询工具已经注册到对话。" : "点击一次即可创建只读/检索/问答权限的独立令牌，并安全保存到 DSH 凭据存储。" })] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.capabilityGrid,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "知识检索" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "按范围、分类和文档召回证据" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "知识问答" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "基于藏知内容生成带引用答案" })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "数据集查询" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: "查看结构、预览并精确查询表格" })] })
						]
					}),
					!configured ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: Cangzhi_module_css_default.primaryButton,
						disabled: busy,
						onClick: () => void connect(),
						children: busy ? "正在连接…" : "启用 DSH 对话能力"
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: Cangzhi_module_css_default.secondaryButton,
						disabled: busy,
						onClick: () => void disconnect(),
						children: "断开对话连接"
					}),
					message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.progressText,
						children: message
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.securityNote,
						children: "令牌仅在创建时从藏知传入 DSH，本页面不会显示或回读密钥；可随时在藏知的访问令牌管理中撤销。"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.tokenList,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: "藏知访问令牌" }), tokens.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "暂无访问令牌" }) : tokens.map((token) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: token.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
								token.token_prefix,
								"… · ",
								token.scopes.join("、")
							] })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"data-revoked": String(Boolean(token.revoked_at)),
								children: token.revoked_at ? "已撤销" : "有效"
							}),
							!token.revoked_at && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: () => void revoke(token.id),
								children: "撤销"
							})
						] }, token.id))]
					})
				]
			});
		}
		function ConsoleOverlay({ useCangzhiConsole, closeConsole, t }) {
			if (!useCangzhiConsole((value) => value).open) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: Cangzhi_module_css_default.overlay,
				role: "dialog",
				"aria-modal": "true",
				"aria-label": t("consoleTitle"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: Cangzhi_module_css_default.consoleHeader,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							className: Cangzhi_module_css_default.consoleTitle,
							children: t("consoleTitle")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Cangzhi_module_css_default.nativeBadge,
							children: t("frameHint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: Cangzhi_module_css_default.closeButton,
							"aria-label": t("close"),
							title: t("close"),
							onClick: closeConsole,
							children: "×"
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NativeWorkspace, {})]
			});
		}
		function openDocumentInWorkbench(id, title) {
			window.dispatchEvent(new CustomEvent("cangzhi-open-document", { detail: {
				id,
				title
			} }));
		}
		function KnowledgeWorkbench({ useCangzhiConsole, openKnowledge, closeKnowledge, openConsole }) {
			const state = useCangzhiConsole((value) => value);
			const [auth, setAuth] = (0, react.useState)(null);
			const [workspace, setWorkspace] = (0, react.useState)(null);
			const [documents, setDocuments] = (0, react.useState)([]);
			const [results, setResults] = (0, react.useState)([]);
			const [query, setQuery] = (0, react.useState)("");
			const [selected, setSelected] = (0, react.useState)(null);
			const [tab, setTab] = (0, react.useState)("browse");
			const [pinned, setPinned] = (0, react.useState)([]);
			const [previewUrl, setPreviewUrl] = (0, react.useState)("");
			const [previewState, setPreviewState] = (0, react.useState)("选择资料后可在这里预览原文");
			const [busy, setBusy] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)("");
			const [width, setWidth] = (0, react.useState)(() => {
				const saved = Number(window.localStorage.getItem("cangzhi-workbench-width"));
				return Number.isFinite(saved) && saved >= 360 && saved <= 760 ? saved : 480;
			});
			const uploadInput = (0, react.useRef)(null);
			const resizeStart = (0, react.useRef)({
				x: 0,
				width: 480
			});
			const widthRef = (0, react.useRef)(width);
			const workspaceSlugRef = (0, react.useRef)(null);
			const load = async () => {
				const authResponse = await fetch(`${API}/auth/status`, {
					credentials: "include",
					cache: "no-store"
				});
				if (!authResponse.ok) throw new Error(await errorMessage(authResponse, "登录状态读取失败"));
				const authValue = await authResponse.json();
				setAuth(authValue);
				if (!authValue.authenticated) {
					setWorkspace(null);
					setDocuments([]);
					setResults([]);
					setSelected(null);
					setPinned([]);
					setPreviewUrl("");
					workspaceSlugRef.current = null;
					return;
				}
				const [documentsResponse, workspaceResponse] = await Promise.all([fetch(`${API}/documents/overview?limit=60&offset=0&include_processing=true`, {
					credentials: "include",
					cache: "no-store"
				}), fetch(`${API}/workspaces/current`, {
					credentials: "include",
					cache: "no-store"
				})]);
				if (!workspaceResponse.ok || !documentsResponse.ok) throw new Error("当前知识空间读取失败");
				const nextWorkspace = await workspaceResponse.json();
				const workspaceChanged = workspaceSlugRef.current !== null && workspaceSlugRef.current !== nextWorkspace.slug;
				workspaceSlugRef.current = nextWorkspace.slug;
				setWorkspace(nextWorkspace);
				setDocuments((await documentsResponse.json()).map((item) => ({
					id: item.id,
					title: item.title,
					source_type: item.source_type,
					updated_at: item.updated_at,
					category: item.primary_category?.name
				})));
				if (workspaceChanged) {
					setQuery("");
					setResults([]);
					setSelected(null);
					setPinned([]);
					setPreviewUrl("");
					setTab("browse");
					setPreviewState("选择资料后可在这里预览原文");
				}
			};
			(0, react.useEffect)(() => {
				if (!state.knowledgeOpen) return;
				const refresh = () => {
					load().catch((caught) => setNotice(caught instanceof Error ? caught.message : "藏知服务不可用"));
				};
				refresh();
				window.addEventListener("cangzhi-workspace-changed", refresh);
				return () => window.removeEventListener("cangzhi-workspace-changed", refresh);
			}, [state.knowledgeOpen]);
			(0, react.useEffect)(() => () => {
				if (previewUrl) URL.revokeObjectURL(previewUrl);
			}, [previewUrl]);
			(0, react.useEffect)(() => {
				const frame = document.querySelector("[data-shell-overlay]")?.parentElement;
				if (frame === void 0 || frame === null || !state.knowledgeOpen) return;
				frame.dataset.cangzhiWorkbench = "true";
				frame.style.setProperty("--cangzhi-workbench-width", `${width}px`);
				return () => {
					delete frame.dataset.cangzhiWorkbench;
					frame.style.removeProperty("--cangzhi-workbench-width");
				};
			}, [state.knowledgeOpen, width]);
			const search = async (event) => {
				event.preventDefault();
				setBusy(true);
				setNotice("");
				const response = await fetch(`${API}/search`, {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						query: query.trim(),
						limit: 40,
						offset: 0
					})
				});
				if (!response.ok) {
					setNotice(await errorMessage(response, "搜索失败"));
					setBusy(false);
					return;
				}
				setResults((await response.json()).hits.map((hit) => ({
					id: hit.document_id,
					title: hit.title,
					source_type: hit.source_type,
					category: hit.categories?.map((item) => item.name).join("、"),
					snippet: hit.snippet
				})));
				setTab("browse");
				setBusy(false);
			};
			const preview = async (item) => {
				setSelected(item);
				setTab("preview");
				setPreviewState("正在生成安全预览…");
				setBusy(true);
				if (previewUrl) {
					URL.revokeObjectURL(previewUrl);
					setPreviewUrl("");
				}
				const response = await fetch(`${API}/documents/${item.id}/preview`, {
					credentials: "include",
					cache: "no-store"
				});
				if (!response.ok) {
					setPreviewState(await errorMessage(response, "这份资料暂时没有可用预览"));
					setBusy(false);
					return;
				}
				const blob = await response.blob();
				setPreviewUrl(URL.createObjectURL(blob));
				setPreviewState("");
				setBusy(false);
			};
			(0, react.useEffect)(() => {
				const open = (event) => {
					const detail = event.detail;
					if (typeof detail?.id !== "number") return;
					const item = documents.find((document) => document.id === detail.id) ?? {
						id: detail.id,
						title: detail.title?.trim() || `资料 #${detail.id}`,
						source_type: "file"
					};
					openKnowledge();
					preview(item);
				};
				window.addEventListener("cangzhi-open-document", open);
				return () => window.removeEventListener("cangzhi-open-document", open);
			}, [
				documents,
				openKnowledge,
				previewUrl
			]);
			const useDocument = (item) => {
				setPinned((items) => items.some((document) => document.id === item.id) ? items : [...items, item]);
				window.dispatchEvent(new CustomEvent("cangzhi-use-document", { detail: { prompt: `请重点读取并基于藏知资料《${item.title}》（document_id: ${item.id}）回答：\n\n` } }));
				setNotice(`已将《${item.title}》加入当前对话，问题草稿已经准备好`);
			};
			const upload = async (files) => {
				if (!files?.length) return;
				setBusy(true);
				setNotice("");
				for (const [index, file] of Array.from(files).entries()) {
					setNotice(`正在上传 ${index + 1}/${files.length}：${file.name}`);
					const body = new FormData();
					body.append("file", file);
					body.append("title", "");
					const response = await fetch(`${API}/files/upload`, {
						method: "POST",
						credentials: "include",
						body
					});
					if (!response.ok) {
						setNotice(await errorMessage(response, `${file.name} 上传失败`));
						setBusy(false);
						return;
					}
				}
				setNotice("上传完成，资料正在处理");
				setBusy(false);
				await load();
				if (uploadInput.current) uploadInput.current.value = "";
			};
			const beginResize = (event) => {
				event.currentTarget.setPointerCapture(event.pointerId);
				resizeStart.current = {
					x: event.clientX,
					width
				};
			};
			const resize = (event) => {
				if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
				const next = Math.min(760, Math.max(360, resizeStart.current.width + resizeStart.current.x - event.clientX));
				widthRef.current = next;
				setWidth(next);
			};
			const endResize = (event) => {
				if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
				event.currentTarget.releasePointerCapture(event.pointerId);
				window.localStorage.setItem("cangzhi-workbench-width", String(widthRef.current));
			};
			if (!state.knowledgeOpen) return null;
			const visible = results.length > 0 || query.trim() ? results : documents;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: Cangzhi_module_css_default.knowledgeWorkbench,
				"aria-label": "藏知工作台",
				style: { width },
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: Cangzhi_module_css_default.workbenchResize,
						role: "separator",
						"aria-orientation": "vertical",
						"aria-label": "调整藏知工作台宽度",
						"aria-valuemin": 360,
						"aria-valuemax": 760,
						"aria-valuenow": width,
						onPointerDown: beginResize,
						onPointerMove: resize,
						onPointerUp: endResize,
						onPointerCancel: endResize
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: Cangzhi_module_css_default.workbenchHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 25 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "藏知工作台" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: workspace?.name ?? "当前知识空间" })] })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							title: "知识库管理",
							onClick: openConsole,
							children: "⚙"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							title: "关闭工作台",
							onClick: closeKnowledge,
							children: "×"
						})] })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
						className: Cangzhi_module_css_default.workbenchTabs,
						"aria-label": "藏知工作台视图",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								"data-active": String(tab === "browse"),
								onClick: () => setTab("browse"),
								children: "资料"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								"data-active": String(tab === "preview"),
								onClick: () => setTab("preview"),
								children: ["预览", selected ? " · 1" : ""]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								"data-active": String(tab === "context"),
								onClick: () => setTab("context"),
								children: ["当前对话", pinned.length > 0 ? ` · ${pinned.length}` : ""]
							})
						]
					}),
					auth === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.drawerLogin,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 44 }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "正在载入知识资料" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "正在连接当前知识空间，请稍候。" })
						]
					}) : !auth.authenticated ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.drawerLogin,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 44 }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "登录后浏览知识资料" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "登录管理账户后，可以在对话旁搜索、预览和上传资料。" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								onClick: openConsole,
								children: "前往登录"
							})
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						tab === "browse" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: Cangzhi_module_css_default.workbenchPane,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Cangzhi_module_css_default.drawerToolbar,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
											onSubmit: search,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "⌕" }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													value: query,
													onChange: (event) => {
														setQuery(event.target.value);
														if (!event.target.value.trim()) setResults([]);
													},
													placeholder: "搜索标题、正文或知识片段"
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													disabled: busy,
													children: busy ? "搜索中…" : "搜索"
												})
											]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											ref: uploadInput,
											hidden: true,
											type: "file",
											accept: ".pdf,.doc,.docx,.xlsx,.xls,.md,.txt",
											multiple: true,
											onChange: (event) => void upload(event.target.files)
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											title: "上传资料",
											onClick: () => uploadInput.current?.click(),
											disabled: busy,
											children: "＋"
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Cangzhi_module_css_default.drawerSectionTitle,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: results.length > 0 || query.trim() ? "搜索结果" : "最近资料" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [visible.length, " 项"] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: Cangzhi_module_css_default.workbenchResults,
									children: visible.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: Cangzhi_module_css_default.drawerEmpty,
										children: "没有找到匹配的资料"
									}) : visible.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										"data-selected": String(selected?.id === item.id),
										onClick: () => void preview(item),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: Cangzhi_module_css_default.drawerFileIcon,
											children: item.source_type === "note" ? "✎" : item.source_type === "url" ? "↗" : "▤"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.title }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [item.category || item.source_type, item.updated_at ? ` · ${new Date(item.updated_at).toLocaleDateString()}` : ""] }),
											item.snippet && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: item.snippet.replace(/\s+/g, " ").slice(0, 150) })
										] })]
									}, item.id))
								})
							]
						}),
						tab === "preview" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: Cangzhi_module_css_default.workbenchPreview,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Cangzhi_module_css_default.previewToolbar,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										onClick: () => setTab("browse"),
										children: "‹ 返回资料"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
										title: selected?.title,
										children: selected?.title ?? "资料预览"
									}),
									selected && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										"data-primary": "true",
										onClick: () => useDocument(selected),
										children: pinned.some((item) => item.id === selected.id) ? "已加入对话" : "加入对话"
									})
								]
							}), previewUrl ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("object", {
								data: previewUrl,
								type: "application/pdf",
								"aria-label": `${selected?.title ?? "资料"}预览`,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "当前浏览器无法显示 PDF 预览。" })
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Cangzhi_module_css_default.previewPlaceholder,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: previewState })]
							})]
						}),
						tab === "context" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: Cangzhi_module_css_default.contextPane,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Cangzhi_module_css_default.contextHero,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CangzhiMark, { size: 34 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "当前对话知识" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
										"模型使用“",
										workspace?.name ?? "当前空间",
										"”，你还可以固定重点资料。"
									] })] })]
								}),
								pinned.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: Cangzhi_module_css_default.contextEmpty,
									children: "尚未固定资料。到“资料”中搜索并预览，然后点击“加入对话”。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: Cangzhi_module_css_default.contextList,
									children: pinned.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "▤" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: item.title }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: ["document_id: ", item.id] })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											onClick: () => setPinned((items) => items.filter((document) => document.id !== item.id)),
											children: "移除"
										})
									] }, item.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Cangzhi_module_css_default.contextTips,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "建议问法" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											onClick: () => window.dispatchEvent(new CustomEvent("cangzhi-use-document", { detail: { prompt: "请综合当前对话中固定的藏知资料，归纳共同结论、分歧与依据，并逐条标注来源。\n\n" } })),
											children: "综合固定资料"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											onClick: () => window.dispatchEvent(new CustomEvent("cangzhi-use-document", { detail: { prompt: "请核对当前问题与藏知资料中的原文，指出能够确认的事实、仍有疑问的部分，并标注来源。\n\n" } })),
											children: "核对事实依据"
										})
									]
								})
							]
						})
					] }),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Cangzhi_module_css_default.workbenchNotice,
						children: notice
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
						className: Cangzhi_module_css_default.workbenchStatus,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { "data-ok": String(auth?.authenticated ?? false) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: auth?.authenticated ? "知识服务在线" : "等待登录" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: busy ? "正在处理…" : `${documents.length} 份资料 · ${pinned.length} 份已加入对话` })
						]
					})
				]
			});
		}
		function argsRawOf(block) {
			return ("kind" in block ? block.call?.argsRaw : block.argsRaw) ?? "";
		}
		function resultTextOf(block) {
			if (!("kind" in block)) return null;
			const text = block.content.map((item) => item.type === "text" ? item.text : JSON.stringify(item)).join("\n");
			if (text.length > 0) return text;
			if (block.error === void 0) return null;
			return `${block.error.name}: ${block.error.code}`;
		}
		function parseObject(text) {
			try {
				const value = JSON.parse(text);
				return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
			} catch {
				return null;
			}
		}
		function argumentSummary(raw) {
			const args = parseObject(raw);
			if (args === null) return raw.trim().slice(0, 160) || null;
			for (const key of [
				"question",
				"query",
				"sql",
				"document_id",
				"chunk_id",
				"dataset_id",
				"scope"
			]) {
				const value = args[key];
				if (typeof value === "string" && value.length > 0) return value.slice(0, 160);
			}
			return null;
		}
		function itemCount(value) {
			if (Array.isArray(value)) return value.length;
			if (typeof value !== "object" || value === null) return null;
			const object = value;
			for (const key of [
				"results",
				"hits",
				"documents",
				"chunks",
				"datasets",
				"rows",
				"items",
				"scopes",
				"facets",
				"evidence"
			]) if (Array.isArray(object[key])) return object[key].length;
			for (const key of ["count", "total"]) if (typeof object[key] === "number") return object[key];
			return null;
		}
		function resultPreview(value) {
			if (value === null) return null;
			for (const key of [
				"answer",
				"summary",
				"title",
				"name",
				"content",
				"text"
			]) {
				const candidate = value[key];
				if (typeof candidate === "string" && candidate.length > 0) return candidate.slice(0, 360);
			}
			return null;
		}
		function nestedRecord(value) {
			if (value === null) return null;
			for (const key of ["structuredContent", "result"]) {
				const candidate = value[key];
				if (typeof candidate === "object" && candidate !== null && !Array.isArray(candidate)) return candidate;
			}
			return value;
		}
		function EvidencePreview({ tool, value }) {
			const payload = nestedRecord(value);
			if (payload === null) return null;
			if (tool === "knowledge_search" && Array.isArray(payload.hits)) {
				const hits = payload.hits.slice(0, 3).filter((item) => typeof item === "object" && item !== null);
				if (!hits.length) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: Cangzhi_module_css_default.evidenceEmpty,
					children: "当前知识空间没有找到相关证据"
				});
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.evidencePreview,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.evidenceHeading,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
							"检索到 ",
							String(payload.total ?? hits.length),
							" 条证据"
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: typeof payload.backend === "string" ? payload.backend : "knowledge" })]
					}), hits.map((hit, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: index + 1 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: String(hit.title ?? "未命名资料") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: String(hit.snippet ?? hit.context ?? "").replace(/\s+/g, " ").slice(0, 180) })] }),
						typeof hit.document_id === "number" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							onClick: () => openDocumentInWorkbench(hit.document_id, String(hit.title ?? "未命名资料")),
							children: "右侧预览"
						})
					] }, `${String(hit.document_id)}:${index}`))]
				});
			}
			if (tool === "knowledge_ask" && typeof payload.answer === "string") {
				const citations = Array.isArray(payload.citations) ? payload.citations.filter((item) => typeof item === "object" && item !== null).slice(0, 5) : [];
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Cangzhi_module_css_default.answerPreview,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: payload.answer.slice(0, 520) }), citations.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["引用 ", citations.length] }), citations.map((citation, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						onClick: () => {
							if (typeof citation.document_id === "number") openDocumentInWorkbench(citation.document_id, String(citation.title ?? citation.document_title ?? "知识证据"));
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: index + 1 }), String(citation.title ?? citation.document_title ?? "知识证据")]
					}, `${String(citation.document_id ?? citation.chunk_id)}:${index}`))] })]
				});
			}
			const preview = resultPreview(payload);
			return preview === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: Cangzhi_module_css_default.toolPreview,
				children: preview
			});
		}
		function CangzhiToolCard({ toolName, block, inspect, t }) {
			const rawName = toolName.startsWith(TOOL_PREFIX) ? toolName.slice(14) : toolName;
			const output = resultTextOf(block);
			const value = output === null ? null : parseObject(output);
			const payload = nestedRecord(value);
			const running = !("kind" in block);
			const failed = !running && block.isError;
			const count = payload === null ? null : itemCount(payload);
			const argument = argumentSummary(argsRawOf(block));
			const status = running ? t("running") : failed ? output?.split("\n", 1)[0] ?? t("failed") : count === null ? t("done") : t("items", { count });
			const title = t(`tools.${rawName}`);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: Cangzhi_module_css_default.toolCard,
				"data-tool": toolName,
				"data-state": failed ? "error" : running ? "running" : "ok",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Cangzhi_module_css_default.toolRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Cangzhi_module_css_default.toolGlyph,
								"aria-hidden": true,
								children: "▤"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Cangzhi_module_css_default.toolTitle,
								children: title
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Cangzhi_module_css_default.toolSummary,
								children: argument === null ? status : `${argument} · ${status}`
							}),
							inspect !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: Cangzhi_module_css_default.inspectButton,
								onClick: inspect,
								title: t("inspect"),
								children: "↗"
							})
						]
					}),
					!failed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EvidencePreview, {
						tool: rawName,
						value
					}),
					output !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: Cangzhi_module_css_default.toolDetails,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("details") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: Cangzhi_module_css_default.toolOutput,
							children: output.slice(0, 12e3)
						})]
					})
				]
			});
		}
		const inject = [
			"slots",
			"locale",
			"settingsScope"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "cangzhi: dictionaries");
			const consoleFace = createConsoleFace();
			const settingsFace = { settingsScope: ctx.settingsScope.bind({ namespace: NS }) };
			ctx.slots.inject("conversation.hero.context", () => ctx.slots.register({
				name: "conversation.hero.context",
				id: "cangzhi-home",
				order: 10,
				inject: () => consoleFace
			}, HomeIntegration));
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "cangzhi-context",
				order: -20,
				inject: () => consoleFace
			}, KnowledgeDock));
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "cangzhi-knowledge-space",
				order: 20,
				inject: () => consoleFace
			}, ConversationKnowledgeHeader));
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "cangzhi-console",
				order: 40,
				locale: NS,
				inject: () => consoleFace
			}, ConsoleAction));
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "cangzhi",
				order: 5,
				label: () => ctx.locale.bind(NS)("settingsTab"),
				locale: NS,
				inject: () => settingsFace
			}, CangzhiSettingsTab));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "cangzhi-console",
				order: 100,
				locale: NS,
				inject: () => consoleFace
			}, ConsoleOverlay));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "cangzhi-knowledge-workbench",
				order: 90,
				inject: () => consoleFace
			}, KnowledgeWorkbench));
			ctx.slots.inject("tool.call.toolview", function* () {
				for (const rawName of RAW_TOOLS) yield ctx.slots.register({
					name: "tool.call.toolview",
					key: `${TOOL_PREFIX}${rawName}`,
					locale: NS
				}, CangzhiToolCard);
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map