
  
  // Card data array
      const opportunityCards = [
        {
          title: "Green Finance Database",
          desc: "The database contains information on funding opportunities, the types of funding and institutions providing the funding and contact details. It is ideal for any entity seeking a broad range of funding...",
          details: "#",
          detailsText: "Click here to download"
        },
        {
          title: "Call for Host Companies",
          desc: "The NBI's Installation, Repair and Maintenance initiative in partnership with the Youth Employment Service invites SME'S who are interested and equipped to host unemployed graduates with green technic...",
          details: "#",
          detailsText: "View Details"
        },
        {
          title: "Green Careers",
          desc: "As South Africa transitions to a more inclusive green economy, making a green career choice can bring benefits for our country and ensure that a healthy environment supports our collective well-being.",
          details: "#",
          detailsText: "View Details"
        },
        {
          title: "Green Finance Platform",
          desc: "The Green Finance Platform (GFP) is a global network of organizations and experts that address major knowledge gaps in sustainable finance.",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Green Policy Platform",
          desc: "The GGKP is a global community of organisations and experts committed to collaboratively generating, managing and sharing  green growth knowledge and data to mobilise a sustainable future.",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Green Industry Platform",
          desc: "The Green Industry Platform (GIP) provides sector-and country-specific technical and practical knowledge to support a green industrial transformation.",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Calling Artisan SMMEs and Employers to host young people for Workspace Learning",
          desc: "Calling on Artisan SMMEs and Employers: Host young people for Workplace learning with benefits including work-ready candidates, covered trainee stipends, and more.",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Department of Forestry, Fisheries and the Environment",
          desc: "A South African government department responsible for protecting, conserving and improving the South African environment and natural resources.",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Centre for Scientific and Industrial Research",
          desc: "A statutory research body that looks at how to make life in South Africa better. The CSIR has created a guide for South Africa's green economy",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Trade & Industrial Policy Strategies",
          desc: "An independent research organisation that focuses on industrial policy, sustainability and inclusive growth",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "National Cleaner Production Centre",
          desc: "A national support programme that drives the transition of South African industry towards a green economy through appropriate resource efficiency and cleaner production interventions",
          details: "#",
          detailsText: "View details"
        },
        {
          title: "Sector education and training authorities",
          desc: "Sector education and training authorities (seta) – your relevant seta can tell you about funding opportunities, especially for skills training",
          details: "#",
          detailsText: "View details"
        }
      ];
      const cardsPerPage = 10;
      let currentPage = 1;
      let searchTerm = '';
      let selectedCategory = '';
      // Map category keywords to card content for demo (customize as needed)
      const categoryKeywords = {
        'procurement': ['procurement'],
        'market-access': ['market access'],
        'capacity-building': ['capacity building'],
        'training': ['training', 'workshop'],
        'enterprise-development': ['enterprise', 'sme', 'business']
      };
      function getFilteredCards() {
        let filtered = opportunityCards;
        if (selectedCategory) {
          const keywords = categoryKeywords[selectedCategory] || [];
          filtered = filtered.filter(card => {
            const text = (card.title + ' ' + (card.desc || '')).toLowerCase();
            return keywords.some(keyword => text.includes(keyword));
          });
        }
        if (searchTerm) {
          filtered = filtered.filter(card =>
            card.title.toLowerCase().includes(searchTerm) ||
            (card.desc && card.desc.toLowerCase().includes(searchTerm))
          );
        }
        return filtered;
      }
      function renderCards(page) {
        const filtered = getFilteredCards();
        const start = (page - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const cards = filtered.slice(start, end);
        const container = document.getElementById('opportunity-cards');
        container.innerHTML = cards.map(card => `
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-body position-relative pb-5">
                <h5 class="card-title opportunity-title fw-semibold mb-3">${card.title}</h5>
                ${card.desc ? `<p class="card-text text-muted mb-4">${card.desc}</p>` : ''}
                <a href="${card.details}" class="subcard-link position-absolute bottom-0 start-0 ms-3 mb-3">${card.detailsText}</a>
              </div>
            </div>
          </div>
        `).join('');
      }
      function renderPagination() {
        const filtered = getFilteredCards();
        const pageCount = Math.ceil(filtered.length / cardsPerPage);
        const pagination = document.getElementById('pagination');
        let html = '';
        html += `<li class="page-item${currentPage === 1 ? ' disabled' : ''}"><a class="page-link" href="#" data-page="prev">Previous</a></li>`;
        for (let i = 1; i <= pageCount; i++) {
          html += `<li class="page-item${i === currentPage ? ' active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        html += `<li class="page-item${currentPage === pageCount ? ' disabled' : ''}"><a class="page-link" href="#" data-page="next">Next</a></li>`;
        pagination.innerHTML = html;
        // Add event listeners
        pagination.querySelectorAll('a.page-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            let page = this.getAttribute('data-page');
            const filtered = getFilteredCards();
            const pageCount = Math.ceil(filtered.length / cardsPerPage);
            if (page === 'prev' && currentPage > 1) {
              currentPage--;
            } else if (page === 'next' && currentPage < pageCount) {
              currentPage++;
            } else if (!isNaN(page)) {
              currentPage = parseInt(page);
            }
            renderCards(currentPage);
            renderPagination();
            window.scrollTo({ top: document.getElementById('opportunity-cards').offsetTop - 100, behavior: 'smooth' });
          });
        });
      }
      // Search functionality
      document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value.trim().toLowerCase();
        currentPage = 1;
        renderCards(currentPage);
        renderPagination();
      });
      // Category filter functionality
      document.getElementById('categoryFilter').addEventListener('change', function(e) {
        selectedCategory = e.target.value;
        currentPage = 1;
        renderCards(currentPage);
        renderPagination();
      });
      document.getElementById('resetSearch').addEventListener('click', function() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        searchTerm = '';
        selectedCategory = '';
        currentPage = 1;
        renderCards(currentPage);
        renderPagination();
      });
      // Initial render
      renderCards(currentPage);
      renderPagination();

      document.querySelectorAll('.business-card-button').forEach((button) => {
        button.addEventListener('click', function () {
          alert('Feature coming soon!');
        });
      });
      document.querySelector('.dashboard-button').addEventListener('click', function () {
        window.location.href = "questionnaire/questionnaire.html";
      });

      