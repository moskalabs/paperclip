---
name: Moska Studio
description: 1인 AI-native 스튜디오. 26개 프로젝트를 12대 PC 위에서 Claude Code 에이전트로 운영. 앱·웹 사업화, 책 집필, 음악 제작 동시 진행.
slug: moska-studio
schema: agentcompanies/v1
version: 0.1.0
license: MIT
authors:
  - name: MoHan (moskalabs)
goals:
  - 앱·웹 서비스 개발과 사업화로 매출 만들기
  - 소설·비문학 책 집필 및 출판
  - 음악 제작 및 발매
  - 1인 운영 체제로 모든 작업을 에이전트 위임 가능 상태로 유지
---

Moska Studio는 MoHan 1인이 운영하는 AI-native 스튜디오다.
사람은 board(이사회) 역할만 하고, 실행은 전부 Paperclip이 오케스트레이션하는
Claude Code 에이전트들이 수행한다.

조직은 3-tier C-레벨 위에 단일 board를 둔다:

- Board: MoHan (사람, 단독 주주)
- CEO: 전사 전략·우선순위·조정
- CTO: 모든 엔지니어링 (Web/App Dev, QA)
- COO: 모든 운영 (Browser Auto, Crawl/Doc, Docs)

CEO/CTO/COO 아래의 IC(개별 기여자) 에이전트는 필요할 때 각 부서장이
`paperclip-create-agent` 스킬로 hire한다.
