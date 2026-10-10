(function() {
      // Conceptual progression: examples grounded in the inspected campaign workflow.
      // Company scope remains an ambition, not a claim of a deployed autonomous company.
      const stagesData = {
        task: {
          label: "Stage 01 · Task",
          title: "Complete a defined assignment.",
          body: "Read the brief, use the relevant context, and return a result someone can inspect. A single assignment establishes the contract: what comes in, what work is allowed, and what counts as done.",
          example: "Illustrative assignment: research a creator against a campaign brief and return the evidence for their fit.",
          nodes: ["Brief", "Research", "Summary"],
          tierTag: "An assignment, made visible",
          countTag: "Task"
        },
        role: {
          label: "Stage 02 · Role",
          title: "Hold an ongoing responsibility.",
          body: "Give the agent a continuing responsibility. A sourcing role needs to carry campaign context, use discovery tools, maintain its shortlist and raise cases it cannot resolve.",
          example: "Illustrative role: keep the creator pipeline current as briefs, candidates and review decisions change.",
          nodes: ["Purpose", "Context", "Tools", "Output", "Review"],
          tierTag: "A role with responsibility",
          countTag: "Role"
        },
        department: {
          label: "Stage 03 · Department",
          title: "Coordinate work across roles.",
          body: "Connect specialists around one operating outcome. Research informs outreach; replies inform the next action; publication evidence informs the report. Shared state makes the handoffs visible.",
          example: "Illustrative department: sourcing, outreach, conversation and analysis working from the same campaign context.",
          nodes: ["Research", "Planning", "Execution", "Review"],
          tierTag: "Specialists working together",
          countTag: "Department"
        },
        company: {
          label: "Stage 04 · Company",
          title: "Operate toward a business objective.",
          body: "Our long-term destination is an organization whose operating work is performed by software. People determine its direction, commit resources, and remain responsible for what the company does.",
          example: "Long-term ambition: agent departments operating together under human ownership and direction.",
          nodes: ["Human direction", "Agent departments", "Business operations", "Accountability"],
          tierTag: "A software organization",
          countTag: "Company"
        }
      };

      const tabs = Array.from(document.querySelectorAll('.tab-btn'));
      const stageLabel = document.getElementById('stage-label');
      const stageTitle = document.getElementById('stage-title');
      const stageBody = document.getElementById('stage-body');
      const stageExample = document.getElementById('stage-example');
      const canvasTierTag = document.getElementById('canvas-tier-tag');
      const nodeCountIndicator = document.getElementById('node-count-indicator');
      const organization = document.getElementById('stage-organization');

      function updateStage(stageKey) {
        const data = stagesData[stageKey];
        if (!data) return;

        // Update narrative elements
        stageLabel.textContent = data.label;
        stageTitle.textContent = data.title;
        stageBody.textContent = data.body;
        stageExample.textContent = data.example;
        canvasTierTag.textContent = data.tierTag;
        nodeCountIndicator.textContent = data.countTag;

        // Keep the narrative and accessible fallback usable without WebGL.
        organization.dataset.sceneStage = stageKey;
        organization.querySelector('.scene-fallback p').textContent = 'Conceptual ' + stageKey + ' structure';
        const list = organization.querySelector('.scene-fallback ol');
        list.replaceChildren(...data.nodes.map(name => {
          const item = document.createElement('li');
          item.textContent = name;
          return item;
        }));
        document.getElementById('stage-panel').setAttribute('aria-labelledby', 'tab-' + stageKey);
        organization.closest('.organization-view').querySelector('[role="group"]').setAttribute('aria-label', stageKey + ' diagram controls');
        window.dispatchEvent(new CustomEvent('agentbase:stage', { detail: { key: stageKey } }));

        // Update tab accessibility states
        tabs.forEach(tab => {
          const isSelected = tab.getAttribute('data-stage') === stageKey;
          tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
          tab.setAttribute('tabindex', isSelected ? '0' : '-1');
        });
      }

      // Initialize default stage
      updateStage('task');

      // Click handling
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          const stage = this.getAttribute('data-stage');
          updateStage(stage);
        });
      });

      // Keyboard navigation support: ArrowLeft, ArrowRight, Home, End
      const tablist = document.querySelector('.tabs-nav-bar');
      tablist.addEventListener('keydown', function(e) {
        const currentIndex = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
        let newIndex = currentIndex;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (currentIndex + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = tabs.length - 1;
        }

        if (newIndex !== currentIndex) {
          const targetTab = tabs[newIndex];
          targetTab.focus();
          updateStage(targetTab.getAttribute('data-stage'));
        }
      });
    })();
